#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_ENV_FILE = path.resolve(__dirname, '..', '.env.local');
const DEFAULT_DEPOSIT_AMOUNTS = [500, 250, 150];
const DEFAULT_WITHDRAW_AMOUNTS = [50, 75];

const parseArgs = (argv) => {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];

    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    if (key === 'useEmulator' || key === 'register' || key === 'dryRun') {
      args[key] = true;
      continue;
    }

    const next = argv[i + 1];
    if (typeof next === 'undefined' || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return args;
};

const loadEnvFile = (filePath) => {
  if (!filePath) {
    return;
  }

  if (!fs.existsSync(filePath)) {
    console.warn(`Aviso: arquivo de ambiente "${filePath}" não encontrado.`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const [rawKey, ...rawValue] = trimmed.split('=');
    if (!rawKey) {
      continue;
    }

    const key = rawKey.trim();
    const value = rawValue.join('=').trim().replace(/^"|"$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

const requireEnv = (key) => {
  const value = process.env[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
  return value;
};

const parseAmountList = (rawValue, fallback) => {
  if (!rawValue) {
    return fallback;
  }

  const normalized = String(rawValue)
    .split(/[,;\s]+/)
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeCallableData = (data) => {
  if (data && typeof data === 'object' && 'result' in data) {
    return data.result;
  }
  return data;
};

const printDivider = () => {
  console.log('\n---------------------------------------------\n');
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  const argv = process.argv.slice(2);
  const options = parseArgs(argv);

  if (!options.email || !options.password) {
    console.error('Uso: node scripts/seed-transactions.mjs --email <email> --password <senha> [--register]');
    process.exitCode = 1;
    return;
  }

  const envFile = options.envFile ? path.resolve(process.cwd(), options.envFile) : DEFAULT_ENV_FILE;
  loadEnvFile(envFile);

  const firebaseConfig = {
    apiKey: requireEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: requireEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
  };

  console.log('Inicializando Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const functions = getFunctions(app);

  if (options.useEmulator) {
    console.log('Conectando aos emuladores do Firebase (auth @ 127.0.0.1:9099, functions @ 127.0.0.1:5001)...');
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }

  const depositAmounts = parseAmountList(options.deposits, DEFAULT_DEPOSIT_AMOUNTS);
  const withdrawAmounts = parseAmountList(options.withdrawals, DEFAULT_WITHDRAW_AMOUNTS);
  const ownerName = options.ownerName ?? options.email;
  const shouldRegister = Boolean(options.register);
  const dryRun = Boolean(options.dryRun);

  console.log(`Usuário alvo: ${options.email}`);
  console.log(`Registrar usuário? ${shouldRegister ? 'Sim' : 'Não (apenas login)'}`);
  console.log(`Dry run? ${dryRun ? 'Sim (nenhuma transação será enviada)' : 'Não'}`);
  console.log(`Depósitos a executar: ${depositAmounts.join(', ') || 'nenhum'}`);
  console.log(`Saques a executar: ${withdrawAmounts.join(', ') || 'nenhum'}`);

  if (dryRun) {
    printDivider();
    console.log('Dry run habilitado: finalizando execução antes de chamar o Firebase.');
    return;
  }

  const signInOrRegister = async () => {
    if (shouldRegister) {
      console.log('Criando usuário...');
      const credential = await createUserWithEmailAndPassword(auth, options.email, options.password);
      console.log(`Usuário criado (uid: ${credential.user.uid}).`);
      return credential.user;
    }

    console.log('Efetuando login...');
    const credential = await signInWithEmailAndPassword(auth, options.email, options.password);
    console.log(`Login efetuado (uid: ${credential.user.uid}).`);
    return credential.user;
  };

  const user = await signInOrRegister();

  const createBankAccountCallable = httpsCallable(functions, 'createBankAccount');
  const performTransactionCallable = httpsCallable(functions, 'performTransaction');
  const getAccountDetailsCallable = httpsCallable(functions, 'getAccountDetails');

  let accountReady = false;

  const ensureBankAccount = async () => {
    try {
      console.log('Verificando existência da conta bancária...');
      const result = await getAccountDetailsCallable({});
      const details = normalizeCallableData(result.data);
      if (details && details.accountNumber) {
        console.log(`Conta existente detectada (conta ${details.accountNumber}).`);
        accountReady = true;
        return;
      }
    } catch (error) {
      const code = error?.code ?? error?.errorInfo?.code;
      if (code && String(code).includes('not-found')) {
        console.log('Conta bancária não encontrada para este usuário.');
      } else {
        console.warn('Falha ao consultar detalhes da conta:', error);
      }
    }

    try {
      console.log('Criando conta bancária inicial...');
      const response = await createBankAccountCallable({
        uid: user.uid,
        email: options.email,
        ownerName,
      });
      const data = normalizeCallableData(response.data);
      console.log('Conta bancária criada:', data);
      accountReady = true;
    } catch (error) {
      console.warn('Não foi possível criar a conta bancária automaticamente. Prosseguindo mesmo assim.');
      console.warn(error);
    }
  };

  await ensureBankAccount();

  if (!accountReady) {
    console.warn('⚠️  Prosseguindo sem confirmação de conta bancária. Os endpoints podem falhar se a conta não existir.');
  }

  printDivider();
  console.log('Executando depósitos...');
  for (const amount of depositAmounts) {
    try {
      console.log(`→ Depositando R$ ${amount.toFixed(2)}...`);
      const response = await performTransactionCallable({ amount, type: 'DEPOSIT' });
      const data = normalizeCallableData(response.data);
      console.log('   Depósito registrado:', data);
      await delay(500);
    } catch (error) {
      console.error('   Falha ao registrar depósito:', error);
    }
  }

  printDivider();
  console.log('Executando saques...');
  for (const amount of withdrawAmounts) {
    try {
      console.log(`→ Sacando R$ ${amount.toFixed(2)}...`);
      const response = await performTransactionCallable({ amount, type: 'WITHDRAWAL' });
      const data = normalizeCallableData(response.data);
      console.log('   Saque registrado:', data);
      await delay(500);
    } catch (error) {
      console.error('   Falha ao registrar saque:', error);
    }
  }

  printDivider();
  console.log('Obtendo saldo atualizado...');
  try {
    const response = await getAccountDetailsCallable({});
    const data = normalizeCallableData(response.data);
    console.log('Detalhes da conta:', data);
  } catch (error) {
    console.warn('Não foi possível obter os detalhes da conta.', error);
  }
};

main()
  .then(() => {
    printDivider();
    console.log('Seeding finalizado.');
  })
  .catch((error) => {
    console.error('Erro durante o seeding de transações:', error);
    process.exitCode = 1;
  });
