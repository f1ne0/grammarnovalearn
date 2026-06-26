import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Button, FormField, Surface } from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { useRegister } from "../../../features/auth";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  inviteCode: z.string().min(6, "Invite code is required"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    registerMutation.mutate(data, { onSuccess: () => navigate("/") });
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
            Create account
          </Text>
        </Flex>
        <Text fontSize="13px" color="textFaint" textAlign="center" mb="28px">
          You need an invite code from your teacher
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
            <FormField
              label="Invite code"
              placeholder="e.g. LEARN2024"
              error={errors.inviteCode?.message}
              {...register("inviteCode")}
            />
            {registerMutation.isError && (
              <Text fontSize="13px" color="error">
                {apiErrorMessage(registerMutation.error)}
              </Text>
            )}
            <Button type="submit" loading={registerMutation.isPending} w="full">
              Register
            </Button>
          </Stack>
        </form>

        <Text fontSize="13px" color="textFaint" textAlign="center" mt="20px">
          Already have an account?{" "}
          <RouterLink to="/login">
            <Text as="span" color="accentHover" fontWeight="500">
              Log in
            </Text>
          </RouterLink>
        </Text>
      </Surface>
    </Box>
  );
}
