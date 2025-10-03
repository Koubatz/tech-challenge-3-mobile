import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  H2,
  Input,
  Paragraph,
  Text,
  XStack,
  YStack,
} from "tamagui";
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
    } catch (error) {
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
    } catch (error) {
      showToast("Erro inesperado. Tente novamente.", "error");
    }
  };

  return (
    <YStack flex={1} backgroundColor="#1a1a1a" paddingTop={40}>
      <StatusBar style="light" />
      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
      />

      {/* Header */}

      {/* Title */}
      <YStack paddingHorizontal={20} marginBottom={40}>
        <H2 color="white" fontSize={28} fontWeight="600" marginBottom={4}>
          Lorem Ipsum
        </H2>
        <Paragraph color="#aaa" fontSize={16}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </Paragraph>
      </YStack>

      {/* Card Container */}
      <Card
        flex={1}
        backgroundColor="white"
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        paddingTop={32}
        paddingHorizontal={24}
      >
        {/* Tabs */}
        <XStack marginBottom={32}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.activeTab]}
            onPress={() => handleTabChange("login")}
          >
            <Text
              color={activeTab === "login" ? "#000" : "#888"}
              fontSize={16}
              fontWeight="600"
            >
              Entrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "register" && styles.activeTab]}
            onPress={() => handleTabChange("register")}
          >
            <Text
              color={activeTab === "register" ? "#000" : "#888"}
              fontSize={16}
              fontWeight="600"
            >
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </XStack>

        {activeTab === "login" ? (
          <YStack space={20}>
            {/* Email Input */}
            <YStack space={8}>
              <Text color="#666" fontSize={14}>
                E-mail
              </Text>
              <XStack
                backgroundColor="#f5f5f5"
                borderRadius={12}
                paddingHorizontal={16}
                paddingVertical={16}
                alignItems="center"
                space={12}
              >
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Input
                  flex={1}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite seu email"
                  backgroundColor="transparent"
                  borderWidth={0}
                  fontSize={16}
                />
              </XStack>
            </YStack>

            {/* Password Input */}
            <YStack space={8}>
              <Text color="#666" fontSize={14}>
                Password
              </Text>
              <XStack
                backgroundColor="#f5f5f5"
                borderRadius={12}
                paddingHorizontal={16}
                paddingVertical={16}
                alignItems="center"
                space={12}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <Input
                  flex={1}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite sua senha"
                  secureTextEntry={!showPassword}
                  backgroundColor="transparent"
                  borderWidth={0}
                  fontSize={password.length > 0 ? 24 : 16}
                  letterSpacing={password.length > 0 ? 4 : 0}
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
              </XStack>
            </YStack>

            {/* Remember Me & Forgot Password */}
            <XStack
              justifyContent="space-between"
              alignItems="center"
              marginTop={8}
            >
              <XStack alignItems="center" space={8}>
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  size="$3"
                />
                <Text color="#666" fontSize={14}>
                  Lembrar deste dispositivo
                </Text>
              </XStack>

              <TouchableOpacity>
                <Text color="#7B9CFF" fontSize={14}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>
            </XStack>

            {/* Login Button */}
            <Button
              backgroundColor="#000"
              color="white"
              fontSize={16}
              fontWeight="600"
              borderRadius={12}
              marginTop={24}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </YStack>
        ) : (
          <YStack space={20}>
            {/* Email Input */}
            <YStack space={8}>
              <Text color="#666" fontSize={14}>
                E-mail
              </Text>
              <XStack
                backgroundColor="#f5f5f5"
                borderRadius={12}
                paddingHorizontal={16}
                paddingVertical={16}
                alignItems="center"
                space={12}
              >
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Input
                  flex={1}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite seu email"
                  backgroundColor="transparent"
                  borderWidth={0}
                  fontSize={16}
                />
              </XStack>
            </YStack>

            {/* Password Input */}
            <YStack space={8}>
              <Text color="#666" fontSize={14}>
                Senha
              </Text>
              <XStack
                backgroundColor="#f5f5f5"
                borderRadius={12}
                paddingHorizontal={16}
                paddingVertical={16}
                alignItems="center"
                space={12}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <Input
                  flex={1}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite sua senha"
                  secureTextEntry={!showPassword}
                  backgroundColor="transparent"
                  borderWidth={0}
                  fontSize={password.length > 0 ? 24 : 16}
                  letterSpacing={password.length > 0 ? 4 : 0}
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
              </XStack>
            </YStack>

            {/* Confirm Password Input */}
            <YStack space={8}>
              <Text color="#666" fontSize={14}>
                Confirmar Senha
              </Text>
              <XStack
                backgroundColor="#f5f5f5"
                borderRadius={12}
                paddingHorizontal={16}
                paddingVertical={16}
                alignItems="center"
                space={12}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <Input
                  flex={1}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirme sua senha"
                  secureTextEntry={!showConfirmPassword}
                  backgroundColor="transparent"
                  borderWidth={0}
                  fontSize={confirmPassword.length > 0 ? 24 : 16}
                  letterSpacing={confirmPassword.length > 0 ? 4 : 0}
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
              </XStack>
            </YStack>

            {/* Register Button */}
            <Button
              backgroundColor="#000"
              color="white"
              fontSize={16}
              fontWeight="600"
              borderRadius={12}
              marginTop={24}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Cadastrar"}
            </Button>
          </YStack>
        )}
      </Card>
    </YStack>
  );
}

const styles = StyleSheet.create({
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
});
