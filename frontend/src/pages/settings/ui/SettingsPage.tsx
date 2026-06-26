import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import {
  CalendarDays,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  FormField,
  PageHeader,
  Skeleton,
  notify,
} from "../../../shared/ui";
import { api, apiErrorMessage } from "../../../shared/api";
import { useSessionStore } from "../../../entities/session";

interface MeResponse {
  id: string;
  email: string;
  role: string;
  group?: "CONTROL" | "EXPERIMENTAL";
  fullName: string | null;
  consentGivenAt: string | null;
  createdAt: string;
}

function useMe() {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => (await api.get<MeResponse>("/auth/me")).data,
  });
}

function ProfileHeader({ me }: { me: MeResponse }) {
  const initials = (me.fullName ?? me.email).slice(0, 2).toUpperCase();
  const since = new Date(me.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <Flex gap="16px" align="center" mb="24px">
      <Flex
        w="64px"
        h="64px"
        borderRadius="full"
        bg="accentSubtle"
        align="center"
        justify="center"
        fontFamily="mono"
        fontSize="22px"
        fontWeight="600"
        color="accentHover"
        flexShrink={0}
      >
        {initials}
      </Flex>
      <Box>
        <Text fontSize="18px" fontWeight="600" color="text">
          {me.fullName ?? me.email}
        </Text>
        <Flex gap="8px" align="center" mt="4px" wrap="wrap">
          <Text fontSize="13px" color="textMuted">
            {me.email}
          </Text>
          <Badge tone="accent">{me.role}</Badge>
        </Flex>
        <Flex gap="6px" align="center" mt="6px">
          <CalendarDays size={13} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
          <Text fontSize="12px" color="textFaint">
            Member since {since}
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { user, setAuth, accessToken, refreshToken } = useSessionStore();
  const { data: me, isLoading } = useMe();

  const [fullName, setFullName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Initialize form from server state
  useEffect(() => {
    if (me) setFullName(me.fullName ?? "");
  }, [me]);

  const invalidateMe = () => void qc.invalidateQueries({ queryKey: ["auth-me"] });

  const saveName = useMutation({
    mutationFn: async () =>
      (await api.patch("/users/me", { fullName })).data,
    onSuccess: () => {
      if (user && accessToken && refreshToken) {
        setAuth({ ...user, fullName }, accessToken, refreshToken);
      }
      invalidateMe();
      notify.success("Name saved");
    },
    onError: (e) => notify.error(apiErrorMessage(e)),
  });

  const changePassword = useMutation({
    mutationFn: async () =>
      (await api.post("/auth/change-password", { oldPassword, newPassword }))
        .data,
    onSuccess: () => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notify.success("Password changed. Other sessions were logged out.");
    },
    onError: (e) => notify.error(apiErrorMessage(e)),
  });

  const setConsent = useMutation({
    mutationFn: async (value: boolean) =>
      (await api.post("/auth/consent", { consent: value })).data,
    onSuccess: (_d, value) => {
      invalidateMe();
      notify.success(value ? "Consent given" : "Consent withdrawn");
    },
    onError: (e) => notify.error(apiErrorMessage(e)),
  });

  const hasConsent = !!me?.consentGivenAt;
  const consentDate = me?.consentGivenAt
    ? new Date(me.consentGivenAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <AppShell>
      <PageHeader title="Account Settings" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {isLoading && <Skeleton height="80px" mb="24px" />}
        {me && <ProfileHeader me={me} />}

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="16px">
          {/* PROFILE */}
          <Card title="Profile">
            <Stack gap="14px">
              <FormField
                label="Full name"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <FormField label="Email" value={me?.email ?? ""} disabled />
              <Button
                alignSelf="flex-start"
                variant="outline"
                loading={saveName.isPending}
                disabled={
                  !fullName.trim() || fullName === (me?.fullName ?? "")
                }
                onClick={() => saveName.mutate()}
              >
                <UserRound size={15} strokeWidth={1.5} />
                Save changes
              </Button>
            </Stack>
          </Card>

          {/* PASSWORD */}
          <Card title="Change password">
            <Stack gap="14px">
              <FormField
                label="Current password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <FormField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={
                  newPassword && newPassword.length < 8
                    ? "Minimum 8 characters"
                    : undefined
                }
              />
              <FormField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={
                  confirmPassword && confirmPassword !== newPassword
                    ? "Passwords don't match"
                    : undefined
                }
              />
              <Button
                alignSelf="flex-start"
                variant="outline"
                loading={changePassword.isPending}
                disabled={
                  !oldPassword ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
                onClick={() => changePassword.mutate()}
              >
                <KeyRound size={15} strokeWidth={1.5} />
                Change password
              </Button>
            </Stack>
          </Card>

        </Grid>

        {/* RESEARCH CONSENT */}
        <Box mt="16px">
          <Card title="Research participation">
            <Flex justify="space-between" align="center" gap="16px" wrap="wrap">
              <Flex gap="10px" align="flex-start" flex="1" minW="240px">
                <ShieldCheck
                  size={18}
                  strokeWidth={1.5}
                  color={hasConsent ? "#3FB950" : "var(--chakra-colors-text-faint)"}
                />
                <Box>
                  <Text fontSize="13px" color="textMuted" lineHeight="1.6">
                    Your anonymized learning data (answers, response times,
                    error categories) may be used for research. You can
                    withdraw at any time — your data will be excluded from
                    future exports.
                  </Text>
                  {hasConsent && consentDate && (
                    <Text fontSize="12px" color="textFaint" mt="6px">
                      Consent given on {consentDate}
                    </Text>
                  )}
                </Box>
              </Flex>
              <Button
                variant={hasConsent ? "outline" : "subtle"}
                loading={setConsent.isPending}
                onClick={() =>
                  hasConsent ? setWithdrawOpen(true) : setConsent.mutate(true)
                }
              >
                {hasConsent ? "Withdraw consent" : "Give consent"}
              </Button>
            </Flex>
          </Card>
        </Box>
      </Box>

      <ConfirmDialog
        open={withdrawOpen}
        title="Withdraw research consent?"
        body="Your data will be excluded from future research exports. This won't affect your learning — you can give consent again at any time."
        confirmLabel="Withdraw consent"
        danger
        loading={setConsent.isPending}
        onConfirm={() =>
          setConsent.mutate(false, { onSuccess: () => setWithdrawOpen(false) })
        }
        onClose={() => setWithdrawOpen(false)}
      />
    </AppShell>
  );
}
