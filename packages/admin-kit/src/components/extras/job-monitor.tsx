import { useState } from "react";
import {
  type RaRecord,
  useGetList,
  useResourceContext,
  useUpdate,
} from "ra-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

type JobStatus = "queued" | "running" | "failed" | "done" | "cancelled";

interface JobRecord extends RaRecord {
  type?: string;
  status: JobStatus;
  payload?: unknown;
  attempts?: number;
  lastError?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_TABS: JobStatus[] = ["running", "queued", "failed", "done"];

interface JobMonitorProps {
  /** Override resource (defaults to surrounding ResourceContext). */
  resource?: string;
  /** Polling interval in ms. `0` disables polling. Default `5000`. */
  pollInterval?: number;
  /** Status tabs to surface, in order. Default `["running","queued","failed","done"]`. */
  tabs?: JobStatus[];
  /** Record field holding the status string. Default `"status"`. */
  statusSource?: string;
  /** Record field holding the job kind / type. Default `"type"`. */
  typeSource?: string;
  /** Record field holding the payload object. Default `"payload"`. */
  payloadSource?: string;
  /** Record field holding the last-error string. Default `"lastError"`. */
  errorSource?: string;
  /** Record field holding the attempt count. Default `"attempts"`. */
  attemptsSource?: string;
  /** When false, hides retry/cancel buttons. Default `true`. */
  actions?: boolean;
}

/**
 * Background job queue dashboard. Reads a polled `useGetList(resource)` and
 * groups rows by status into tabs. Each row exposes retry (for failed) and
 * cancel (for running/queued) actions.
 *
 * @example
 * <JobMonitor resource="jobs" pollInterval={5000} />
 */
function JobMonitor(props: JobMonitorProps) {
  const {
    resource: resourceProp,
    pollInterval = 5000,
    tabs = DEFAULT_TABS,
    statusSource = "status",
    typeSource = "type",
    payloadSource = "payload",
    errorSource = "lastError",
    attemptsSource = "attempts",
    actions = true,
  } = props;
  const resource = useResourceContext({ resource: resourceProp });
  const { data, isLoading } = useGetList<JobRecord>(
    resource ?? "jobs",
    {
      pagination: { page: 1, perPage: 200 },
      sort: { field: "createdAt", order: "DESC" },
    },
    {
      refetchInterval: pollInterval > 0 ? pollInterval : false,
    },
  );
  const [update] = useUpdate();
  const [activeTab, setActiveTab] = useState<JobStatus>(tabs[0]);
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set());

  if (isLoading || !data) return null;

  const byStatus = tabs.reduce<Record<JobStatus, JobRecord[]>>(
    (acc, status) => {
      acc[status] = data.filter(
        (r) => (r[statusSource] as JobStatus) === status,
      );
      return acc;
    },
    {} as Record<JobStatus, JobRecord[]>,
  );

  const handleRetry = (record: JobRecord) => {
    update(resource ?? "jobs", {
      id: record.id,
      data: {
        [statusSource]: "queued",
        [attemptsSource]: ((record[attemptsSource] as number) ?? 0) + 1,
      },
      previousData: record,
    });
  };

  const handleCancel = (record: JobRecord) => {
    update(resource ?? "jobs", {
      id: record.id,
      data: { [statusSource]: "cancelled" },
      previousData: record,
    });
  };

  const togglePayload = (id: string | number) => {
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Job Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as JobStatus)}
        >
          <TabsList>
            {tabs.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status}
                <Badge variant="secondary" className="ml-2">
                  {byStatus[status]?.length ?? 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((status) => (
            <TabsContent key={status} value={status}>
              {byStatus[status]?.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No {status} jobs.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {byStatus[status]?.map((job) => (
                    <li
                      key={job.id}
                      data-job-row
                      data-job-id={job.id}
                      className="rounded border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {String(job[typeSource] ?? "(no type)")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            id: {job.id} · attempts:{" "}
                            {String(job[attemptsSource] ?? 0)}
                            {job.createdAt && (
                              <>
                                {" "}
                                · created{" "}
                                {new Date(job.createdAt).toLocaleString()}
                              </>
                            )}
                          </span>
                        </div>
                        {actions && (
                          <div className="flex gap-1">
                            {status === "failed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                data-job-retry
                                onClick={() => handleRetry(job)}
                              >
                                <RotateCcw className="h-3 w-3" />
                                Retry
                              </Button>
                            )}
                            {(status === "running" || status === "queued") && (
                              <Button
                                size="sm"
                                variant="outline"
                                data-job-cancel
                                onClick={() => handleCancel(job)}
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </Button>
                            )}
                            {status === "done" && (
                              <Badge variant="secondary">
                                <Check className="mr-1 h-3 w-3" />
                                Done
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {Boolean(job[errorSource]) && (
                        <p className="mt-1 text-xs text-red-700">
                          {String(job[errorSource])}
                        </p>
                      )}
                      {Boolean(job[payloadSource]) && (
                        <div className="mt-2">
                          <button
                            type="button"
                            className="text-xs text-muted-foreground underline"
                            onClick={() => togglePayload(job.id)}
                          >
                            {expanded.has(job.id) ? "Hide" : "Show"} payload
                          </button>
                          {expanded.has(job.id) && (
                            <pre
                              data-job-payload
                              className={cn(
                                "mt-1 max-h-40 overflow-y-auto rounded bg-muted p-2 text-xs",
                              )}
                            >
                              {JSON.stringify(job[payloadSource], null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export { type JobStatus, type JobRecord, type JobMonitorProps, JobMonitor };
