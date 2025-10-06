import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "../components/Toast";
import { useAuth } from "../hooks/useAuth";
import { validateLoginForm, validateRegisterForm } from "../utils/validation";

export default function LoginScreen() {
  const { login, register, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para o Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated]);

  // Limpar campos ao trocar de aba
  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async () => {
    // Validar formulário
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      showToast(validation.message!, "error");
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        showToast("Login realizado com sucesso!", "success");
        // O redirecionamento será feito pelo useEffect quando isAuthenticated mudar
      } else {
        showToast(result.error || "Erro ao fazer login", "error");
      }
    } catch {
      showToast("Erro inesperado. Tente novamente.", "error");
    }
  };

  const handleRegister = async () => {
    // Validar formulário
    const validation = validateRegisterForm(email, password, confirmPassword);
    if (!validation.isValid) {
      showToast(validation.message!, "error");
      return;
    }

    try {
      const result = await register(email, password);
      
      if (result.success) {
        showToast("Conta criada com sucesso!", "success");
        // O redirecionamento será feito pelo useEffect quando isAuthenticated mudar
      } else {
        showToast(result.error || "Erro ao criar conta", "error");
      }
    } catch {
      showToast("Erro inesperado. Tente novamente.", "error");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Lorem Ipsum
        </Text>
        <Text style={styles.subtitle}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </Text>
      </View>

      {/* Card Container */}
      <View style={styles.card}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.activeTab]}
            onPress={() => handleTabChange("login")}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === "login" ? "#000" : "#888" }
            ]}>
              Entrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "register" && styles.activeTab]}
            onPress={() => handleTabChange("register")}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === "register" ? "#000" : "#888" }
            ]}>
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {activeTab === "login" ? (
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Digite seu email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" />
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        fontSize: password.length > 0 ? 24 : 16,
                        letterSpacing: password.length > 0 ? 4 : 0
                      }
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Digite sua senha"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsContainer}>
                <View style={styles.rememberMeContainer}>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                  />
                  <Text style={styles.rememberMeText}>
                    Lembrar deste dispositivo
                  </Text>
                </View>

                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>
                    Esqueceu sua senha?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Digite seu email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" />
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        fontSize: password.length > 0 ? 24 : 16,
                        letterSpacing: password.length > 0 ? 4 : 0
                      }
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Digite sua senha"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" />
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        fontSize: confirmPassword.length > 0 ? 24 : 16,
                        letterSpacing: confirmPassword.length > 0 ? 4 : 0
                      }
                    ]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirme sua senha"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Criando conta..." : "Cadastrar"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#7B9CFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "#666",
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: "center",
    gap: 8,
  },
  rememberMeText: {
    color: "#666",
    fontSize: 14,
  },
  forgotPasswordText: {
    color: "#7B9CFF",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});