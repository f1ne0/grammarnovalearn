import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Button, FormField, Surface } from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { useLogin } from "../../../features/auth";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    login.mutate(data, { onSuccess: () => navigate("/") });
  };

  return (
    <Box
      minH="100vh"
      bg="bg"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="16px"
    >
      <Surface w="full" maxW="400px" p="32px">
        <Flex align="center" justify="center" gap="10px" mb="6px">
          <GraduationCap size={22} strokeWidth={1.5} color="#4F7CFF" />
          <Text fontSize="18px" fontWeight="600" color="text">
            GrammarNovaLearn
          </Text>
        </Flex>
        <Text fontSize="13px" color="textFaint" textAlign="center" mb="28px">
          English grammar for IT students
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="16px">
            <FormField
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <FormField
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            {login.isError && (
              <Text fontSize="13px" color="error">
                {apiErrorMessage(login.error)}
              </Text>
            )}
            <Button type="submit" loading={login.isPending} w="full">
              Log in
            </Button>
          </Stack>
        </form>

        <Text fontSize="13px" color="textFaint" textAlign="center" mt="20px">
          Don't have an account?{" "}
          <RouterLink to="/register">
            <Text as="span" color="accentHover" fontWeight="500">
              Register
            </Text>
          </RouterLink>
        </Text>
      </Surface>
    </Box>
  );
}
