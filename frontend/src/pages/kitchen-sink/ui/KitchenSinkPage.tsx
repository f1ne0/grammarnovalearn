import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Inbox,
  Mic,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  FormField,
  PageHeader,
  Progress,
  Skeleton,
  StatCard,
  Surface,
} from "../../../shared/ui";

const demoRows = [
  { topic: "Present Simple", unit: 1, mastery: 85, status: "success" },
  { topic: "Past Continuous", unit: 6, mastery: 42, status: "warning" },
  { topic: "Third Conditional", unit: 15, mastery: 12, status: "error" },
];

/** Visual QA route: renders every kit component. */
export default function KitchenSinkPage() {
  return (
    <AppShell>
      <PageHeader
        title="Kitchen Sink"
        breadcrumb="Design system / components"
        actions={
          <>
            <Button variant="outline">
              <Download size={15} strokeWidth={1.5} />
              Export
            </Button>
            <Button>
              <Sparkles size={15} strokeWidth={1.5} />
              Primary
            </Button>
          </>
        }
      />
      <Box maxW="1280px" px={{ base: "16px", md: "32px" }} py="24px">
        <Stack gap="32px">
          {/* Stat cards */}
          <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap="16px">
            <StatCard label="Average mastery" value="73%" icon={TrendingUp} trend="+12%" sub="vs last week" />
            <StatCard label="Attempts" value="1,284" icon={CheckCircle2} />
            <StatCard label="Due for review" value="7" icon={Clock} sub="42 tracked" />
            <StatCard label="Speaking sessions" value="36" icon={Mic} />
          </Grid>

          {/* Buttons */}
          <Card title="Buttons">
            <Flex gap="10px" wrap="wrap">
              <Button>Solid</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="subtle">Subtle</Button>
              <Button variant="danger">Danger</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </Flex>
          </Card>

          {/* Badges */}
          <Card title="Badges">
            <Flex gap="10px" wrap="wrap">
              <Badge>Neutral</Badge>
              <Badge tone="accent">Accent</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="error">Error</Badge>
            </Flex>
          </Card>

          {/* Forms */}
          <Card title="Form fields">
            <Stack gap="16px" maxW="360px">
              <FormField label="Email" placeholder="you@example.com" />
              <FormField label="With error" error="This field is required" />
            </Stack>
          </Card>

          {/* Progress */}
          <Card title="Progress">
            <Stack gap="16px" maxW="360px">
              <Progress value={15} showLabel />
              <Progress value={55} showLabel />
              <Progress value={90} showLabel />
            </Stack>
          </Card>

          {/* Table */}
          <Card title="Data table" noPadding>
            <DataTable
              columns={[
                { key: "topic", label: "Topic", w: 3 },
                { key: "unit", label: "Unit", w: 1 },
                { key: "mastery", label: "Mastery", w: 2 },
                { key: "status", label: "Status", w: 1 },
              ]}
              rows={demoRows}
              renderCell={(r, key) => {
                switch (key) {
                  case "topic":
                    return <Text fontSize="14px">{r.topic}</Text>;
                  case "unit":
                    return (
                      <Text fontFamily="mono" fontSize="13px" color="textMuted">
                        {r.unit}
                      </Text>
                    );
                  case "mastery":
                    return <Progress value={r.mastery} />;
                  case "status":
                    return (
                      <Badge tone={r.status as "success" | "warning" | "error"}>
                        {r.status}
                      </Badge>
                    );
                  default:
                    return null;
                }
              }}
            />
          </Card>

          {/* Empty + skeleton */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="16px">
            <Card title="Empty state">
              <EmptyState
                icon={Inbox}
                title="No data available"
                description="There is nothing to show here yet."
                action={<Button variant="subtle">Start learning</Button>}
              />
            </Card>
            <Card title="Skeleton">
              <Stack gap="10px">
                <Skeleton h="32px" />
                <Skeleton h="16px" w="80%" />
                <Skeleton h="16px" w="60%" />
              </Stack>
            </Card>
          </Grid>

          {/* Surface + typography */}
          <Surface>
            <Text fontSize="28px" fontWeight="600" letterSpacing="-0.02em" mb="8px">
              Display 28/600
            </Text>
            <Text fontSize="18px" fontWeight="600" mb="8px">
              Heading 18/600
            </Text>
            <Text fontSize="14px" color="textMuted" mb="8px">
              Body 14/400 — muted. The quick brown fox jumps over the lazy dog.
            </Text>
            <Text fontFamily="mono" fontSize="32px" fontWeight="600">
              1,234.56
            </Text>
            <Flex align="center" gap="6px" mt="12px">
              <BookOpen size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
              <Text fontSize="12px" color="textFaint" textTransform="uppercase" letterSpacing="0.03em">
                Caption 12/500 with icon
              </Text>
            </Flex>
          </Surface>
        </Stack>
      </Box>
    </AppShell>
  );
}
