import { useParams } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { Layout } from "@/components/layout";
import { useAccount, useProcessDemo, useProcessOnboarding } from "@/hooks/use-accounts";
import { StatusBadge } from "@/components/status-badge";
import { JsonViewer } from "@/components/json-viewer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Cpu, History, ArrowLeft, Loader2, PlayCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function AccountDetails() {
  const { id } = useParams<{ id: string }>();
  const accountId = parseInt(id, 10);
  
  const { data, isLoading, isError } = useAccount(accountId);
  const { mutate: processDemo, isPending: isDemoPending } = useProcessDemo(accountId);
  const { mutate: processOnboarding, isPending: isOnboardingPending } = useProcessOnboarding(accountId);
  const { toast } = useToast();

  const [demoTranscript, setDemoTranscript] = useState("");
  const [onboardingTranscript, setOnboardingTranscript] = useState("");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-white">Account Not Found</h3>
          <p className="text-muted-foreground mt-2 mb-6">The account you are looking for does not exist or an error occurred.</p>
          <Link href="/">
            <Button variant="outline" className="rounded-xl border-white/10">Return to Accounts</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { account, transcripts, memos, configs, changelogs } = data;

  const handleProcessDemo = () => {
    if (!demoTranscript.trim()) return;
    processDemo(
      { transcript: demoTranscript },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Demo transcript processed successfully!" });
          setDemoTranscript("");
        },
        onError: (err) => toast({ title: "Processing Failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleProcessOnboarding = () => {
    if (!onboardingTranscript.trim()) return;
    processOnboarding(
      { transcript: onboardingTranscript },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Onboarding transcript processed successfully!" });
          setOnboardingTranscript("");
        },
        onError: (err) => toast({ title: "Processing Failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  const isDemoEnabled = account.status === 'new';
  const isOnboardingEnabled = account.status === 'demo_processed';

  return (
    <Layout>
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              {account.companyName}
            </h1>
            <div className="flex items-center gap-3">
              <StatusBadge status={account.status} />
              <span className="text-sm text-muted-foreground font-mono">ID: {account.id}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="inputs" className="w-full">
        <TabsList className="bg-card/50 border border-white/5 p-1 rounded-xl mb-8 overflow-x-auto flex w-fit max-w-full">
          <TabsTrigger value="inputs" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            Inputs (Transcripts)
          </TabsTrigger>
          <TabsTrigger value="outputs" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Cpu className="w-4 h-4 mr-2" />
            Outputs (Memos & Configs)
          </TabsTrigger>
          <TabsTrigger value="changelog" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="w-4 h-4 mr-2" />
            Changelog
          </TabsTrigger>
        </TabsList>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <TabsContent value="inputs" className="outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demo Form */}
              <div className={`glass-panel p-6 rounded-2xl flex flex-col ${!isDemoEnabled ? 'opacity-70 grayscale-[30%]' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-accent" /> Process Demo Call
                  </h3>
                  {!isDemoEnabled && account.status !== 'new' && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste the raw transcript from the initial demo call to generate the v1 agent configuration and memo.
                </p>
                <Textarea
                  placeholder="Paste demo transcript here..."
                  className="min-h-[250px] resize-none bg-black/40 border-white/10 focus-visible:ring-primary rounded-xl mb-4 text-sm font-mono flex-1"
                  value={demoTranscript}
                  onChange={(e) => setDemoTranscript(e.target.value)}
                  disabled={!isDemoEnabled || isDemoPending}
                />
                <Button 
                  className="w-full rounded-xl" 
                  disabled={!isDemoEnabled || isDemoPending || !demoTranscript.trim()}
                  onClick={handleProcessDemo}
                >
                  {isDemoPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    "Run Demo Pipeline"
                  )}
                </Button>
              </div>

              {/* Onboarding Form */}
              <div className={`glass-panel p-6 rounded-2xl flex flex-col ${!isOnboardingEnabled ? 'opacity-70 grayscale-[30%]' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-400" /> Process Onboarding Call
                  </h3>
                  {!isOnboardingEnabled && account.status === 'onboarding_processed' && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                  {!isOnboardingEnabled && account.status === 'new' && (
                    <span className="text-xs px-2 py-1 bg-white/10 text-muted-foreground rounded-md">
                      Requires Demo First
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste the onboarding transcript to refine the agent configuration to v2 and generate the updated memo.
                </p>
                <Textarea
                  placeholder="Paste onboarding transcript here..."
                  className="min-h-[250px] resize-none bg-black/40 border-white/10 focus-visible:ring-primary rounded-xl mb-4 text-sm font-mono flex-1"
                  value={onboardingTranscript}
                  onChange={(e) => setOnboardingTranscript(e.target.value)}
                  disabled={!isOnboardingEnabled || isOnboardingPending}
                />
                <Button 
                  className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white" 
                  disabled={!isOnboardingEnabled || isOnboardingPending || !onboardingTranscript.trim()}
                  onClick={handleProcessOnboarding}
                >
                  {isOnboardingPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    "Run Onboarding Pipeline"
                  )}
                </Button>
              </div>
            </div>
            
            {/* Show previously submitted transcripts if any */}
            {transcripts?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold font-display text-white mb-4">Submitted Transcripts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transcripts.map((t: any) => (
                    <div key={t.id} className="p-4 border border-white/5 bg-black/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          {t.stage} Stage
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(t.createdAt), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 line-clamp-3 font-mono">{t.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outputs" className="outline-none space-y-8">
            {memos?.length === 0 && configs?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl">
                <Cpu className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-white">No Outputs Yet</h3>
                <p className="text-muted-foreground">Run a pipeline in the Inputs tab to generate memos and configurations.</p>
              </div>
            )}

            {/* Version 1 (Demo) */}
            {(memos?.find((m: any) => m.version === 1) || configs?.find((c: any) => c.version === 1)) && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">V1</span>
                  Demo Outputs
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {memos.filter((m: any) => m.version === 1).map((memo: any) => (
                    <div key={`memo-v1-${memo.id}`} className="glass-panel rounded-2xl overflow-hidden flex flex-col">
                      <div className="p-4 bg-black/40 border-b border-white/5 flex justify-between items-center">
                        <h4 className="font-bold text-white">Structured Memo (v1)</h4>
                        <span className="text-xs text-muted-foreground">{format(new Date(memo.createdAt), "MMM d, HH:mm")}</span>
                      </div>
                      <div className="p-4 flex-1">
                        <JsonViewer data={memo.data} className="h-full max-h-[500px]" />
                      </div>
                    </div>
                  ))}
                  {configs.filter((c: any) => c.version === 1).map((config: any) => (
                    <div key={`config-v1-${config.id}`} className="glass-panel rounded-2xl overflow-hidden flex flex-col">
                      <div className="p-4 bg-black/40 border-b border-white/5 flex justify-between items-center">
                        <h4 className="font-bold text-white">Agent Spec (v1)</h4>
                        <span className="text-xs text-muted-foreground">{format(new Date(config.createdAt), "MMM d, HH:mm")}</span>
                      </div>
                      <div className="p-4 flex-1">
                        <JsonViewer data={config.data} className="h-full max-h-[500px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Version 2 (Onboarding) */}
            {(memos?.find((m: any) => m.version === 2) || configs?.find((c: any) => c.version === 2)) && (
              <div className="space-y-4 pt-4">
                <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 text-sm">V2</span>
                  Onboarding Outputs
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {memos.filter((m: any) => m.version === 2).map((memo: any) => (
                    <div key={`memo-v2-${memo.id}`} className="glass-panel rounded-2xl overflow-hidden flex flex-col border-green-500/20">
                      <div className="p-4 bg-black/40 border-b border-white/5 flex justify-between items-center">
                        <h4 className="font-bold text-white">Refined Memo (v2)</h4>
                        <span className="text-xs text-muted-foreground">{format(new Date(memo.createdAt), "MMM d, HH:mm")}</span>
                      </div>
                      <div className="p-4 flex-1">
                        <JsonViewer data={memo.data} className="h-full max-h-[500px]" />
                      </div>
                    </div>
                  ))}
                  {configs.filter((c: any) => c.version === 2).map((config: any) => (
                    <div key={`config-v2-${config.id}`} className="glass-panel rounded-2xl overflow-hidden flex flex-col border-green-500/20">
                      <div className="p-4 bg-black/40 border-b border-white/5 flex justify-between items-center">
                        <h4 className="font-bold text-white">Refined Agent Spec (v2)</h4>
                        <span className="text-xs text-muted-foreground">{format(new Date(config.createdAt), "MMM d, HH:mm")}</span>
                      </div>
                      <div className="p-4 flex-1">
                        <JsonViewer data={config.data} className="h-full max-h-[500px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="changelog" className="outline-none">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl">
              <h3 className="text-2xl font-bold font-display text-white mb-6">Evolution Changelog</h3>
              
              {changelogs?.length === 0 ? (
                <div className="py-12 text-center">
                  <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No changelog entries yet. Complete the onboarding pipeline to see differences.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-white/10 ml-4 pl-8 space-y-12">
                  {changelogs?.map((log: any) => (
                    <div key={log.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute w-4 h-4 bg-primary rounded-full -left-[41px] top-1 shadow-[0_0_10px_rgba(var(--primary),0.5)] border-2 border-background"></div>
                      
                      <div className="mb-2 flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/5 rounded-md text-sm font-bold text-white border border-white/10">
                          v{log.fromVersion} → v{log.toVersion}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      
                      <div className="bg-black/30 border border-white/5 rounded-xl p-5 mt-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Modifications</h4>
                        <ul className="space-y-3">
                          {Array.isArray(log.changes) ? (
                            log.changes.map((change: any, i: number) => (
                              <li key={i} className="flex gap-3 text-sm">
                                <span className="text-primary mt-1">•</span>
                                <span className="text-white/80 leading-relaxed">
                                  {typeof change === 'string' ? change : JSON.stringify(change)}
                                </span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-white/80">
                              <JsonViewer data={log.changes} />
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </Layout>
  );
}
