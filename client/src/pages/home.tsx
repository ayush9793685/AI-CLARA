import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, ArrowRight, Building2, ServerCrash } from "lucide-react";
import { useAccounts, useCreateAccount } from "@/hooks/use-accounts";
import { Layout } from "@/components/layout";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Home() {
  const { data: accounts, isLoading, isError } = useAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    createAccount(
      { companyName },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setCompanyName("");
          toast({
            title: "Success",
            description: "Account created successfully.",
          });
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Accounts</h1>
          <p className="text-muted-foreground">Manage AI automation pipelines and agent configurations.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl">
              <Plus className="w-4 h-4" />
              Create Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass-panel border-white/10 text-white">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="font-display">Create New Account</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Initialize a new AI agent pipeline for a client.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="companyName" className="text-white/80">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp, Inc."
                    className="bg-black/50 border-white/10 focus-visible:ring-primary rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isCreating || !companyName.trim()}
                  className="rounded-xl w-full sm:w-auto"
                >
                  {isCreating ? "Creating..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-card/50 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl">
          <ServerCrash className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-white">Failed to load accounts</h3>
          <p className="text-muted-foreground mt-2">There was an error communicating with the server.</p>
        </div>
      ) : accounts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-3xl bg-card/20">
          <Building2 className="w-16 h-16 text-muted-foreground/30 mb-6" />
          <h3 className="text-2xl font-display font-bold text-white mb-2">No accounts yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Create your first account to start processing demo and onboarding transcripts.</p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
            Create First Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts?.map((account: any, idx: number) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              key={account.id}
            >
              <Link href={`/accounts/${account.id}`}>
                <div className="group block h-full p-6 glass-panel rounded-2xl hover:border-primary/50 hover:bg-card/80 transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <StatusBadge status={account.status} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 font-display group-hover:text-primary transition-colors">
                      {account.companyName}
                    </h3>
                    
                    <div className="mt-auto pt-6 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="font-mono text-xs opacity-60">ID: {account.id}</span>
                      <span>{account.createdAt ? format(new Date(account.createdAt), "MMM d, yyyy") : "N/A"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
