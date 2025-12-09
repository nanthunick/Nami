"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { encrypt, decrypt } from "@/lib/encryption";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react";

interface MigrationStats {
  total: number;
  encrypted: number;
  remaining: number;
}

interface VerificationResult {
  success: boolean;
  tested: number;
  passed: number;
  failed: number;
  details: string[];
}

export default function MigrationPage() {
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Count total transactions
      const { count: total } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Count encrypted transactions
      const { count: encrypted } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_encrypted", true);

      setStats({
        total: total || 0,
        encrypted: encrypted || 0,
        remaining: (total || 0) - (encrypted || 0),
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch migration statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const migrateData = async () => {
    if (!user) return;

    setIsMigrating(true);
    setError(null);
    setProgress(0);

    try {
      // Fetch all unencrypted transactions (ONLY is_encrypted = false or NULL)
      const { data: transactions, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .or("is_encrypted.is.null,is_encrypted.eq.false");

      if (fetchError) throw fetchError;

      if (!transactions || transactions.length === 0) {
        setCompleted(true);
        setIsMigrating(false);
        return;
      }

      console.log(`Starting migration for ${transactions.length} unencrypted transactions`);

      // Encrypt and update each transaction
      const total = transactions.length;
      let processed = 0;
      let skipped = 0;
      let failed = 0;

      for (const transaction of transactions) {
        try {
          // Skip if already encrypted (safety check)
          if (transaction.is_encrypted === true && transaction.amount_encrypted) {
            console.log(`Skipping already encrypted transaction: ${transaction.id}`);
            skipped++;
            continue;
          }

          // Encrypt the data
          const amountEncrypted = encrypt(transaction.amount.toString(), user.id);
          const descriptionEncrypted = encrypt(transaction.description || '', user.id);

          // Verify encryption worked (decryption test)
          const testDecryptAmount = decrypt(amountEncrypted, user.id);
          const testDecryptDesc = decrypt(descriptionEncrypted, user.id);
          
          if (parseFloat(testDecryptAmount) !== parseFloat(transaction.amount)) {
            throw new Error(`Encryption verification failed for transaction ${transaction.id}`);
          }

          // Update the transaction
          const { error: updateError } = await supabase
            .from("transactions")
            .update({
              amount_encrypted: amountEncrypted,
              description_encrypted: descriptionEncrypted,
              is_encrypted: true,
            })
            .eq("id", transaction.id)
            .eq("user_id", user.id);

          if (updateError) {
            console.error(`Error updating transaction ${transaction.id}:`, updateError);
            failed++;
          } else {
            processed++;
            console.log(`Encrypted transaction ${transaction.id}: amount=${transaction.amount}`);
          }

          setProgress(Math.round(((processed + skipped + failed) / total) * 100));

          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`Error encrypting transaction ${transaction.id}:`, err);
          failed++;
        }
      }

      console.log(`Migration complete: ${processed} encrypted, ${skipped} skipped, ${failed} failed`);

      setCompleted(true);
      await fetchStats();
    } catch (err) {
      console.error("Migration error:", err);
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setIsMigrating(false);
    }
  };

  const verifyEncryption = async () => {
    if (!user) return;

    setIsVerifying(true);
    const details: string[] = [];
    let passed = 0;
    let failed = 0;

    try {
      // Get 10 random encrypted transactions
      const { data: transactions, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_encrypted", true)
        .limit(10);

      if (fetchError) throw fetchError;

      if (!transactions || transactions.length === 0) {
        setVerification({
          success: false,
          tested: 0,
          passed: 0,
          failed: 0,
          details: ["No encrypted transactions found to verify"],
        });
        setIsVerifying(false);
        return;
      }

      // Try to fetch backup data for comparison
      const { data: backup } = await supabase
        .from("transactions_backup_pre_encryption")
        .select("*")
        .in("id", transactions.map(t => t.id));

      for (const transaction of transactions) {
        try {
          // Check fields exist
          if (!transaction.amount_encrypted || !transaction.description_encrypted) {
            details.push(`❌ Transaction ${transaction.id.slice(0, 8)}: Missing encrypted fields`);
            failed++;
            continue;
          }

          // Decrypt and verify
          const decryptedAmount = decrypt(transaction.amount_encrypted, user.id);
          const decryptedDesc = decrypt(transaction.description_encrypted, user.id);

          // Compare with backup if available
          const backupRow = backup?.find(b => b.id === transaction.id);
          if (backupRow) {
            const amountMatch = parseFloat(decryptedAmount) === parseFloat(backupRow.amount);
            const descMatch = decryptedDesc === (backupRow.description || '');

            if (amountMatch && descMatch) {
              details.push(`✓ Transaction ${transaction.id.slice(0, 8)}: Verified against backup`);
              passed++;
            } else {
              details.push(`❌ Transaction ${transaction.id.slice(0, 8)}: Mismatch with backup`);
              failed++;
            }
          } else {
            // Just verify decryption works
            if (decryptedAmount && !isNaN(parseFloat(decryptedAmount))) {
              details.push(`✓ Transaction ${transaction.id.slice(0, 8)}: Decryption successful`);
              passed++;
            } else {
              details.push(`❌ Transaction ${transaction.id.slice(0, 8)}: Decryption failed`);
              failed++;
            }
          }
        } catch (err) {
          details.push(`❌ Transaction ${transaction.id.slice(0, 8)}: Error - ${err}`);
          failed++;
        }
      }

      setVerification({
        success: failed === 0,
        tested: transactions.length,
        passed,
        failed,
        details,
      });
    } catch (err) {
      setVerification({
        success: false,
        tested: 0,
        passed: 0,
        failed: 0,
        details: [`Error during verification: ${err}`],
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to run the migration
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Data Encryption Migration
          </h1>
          <p className="text-muted-foreground mt-2">
            Encrypt your existing financial data for enhanced security
          </p>
        </div>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Status</CardTitle>
            <CardDescription>
              Current encryption status of your transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading statistics...</span>
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.encrypted}</div>
                    <div className="text-sm text-muted-foreground">Encrypted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.remaining}</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>

                {stats.remaining > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-900">
                      <strong>{stats.remaining} transactions</strong> need to be encrypted for maximum security.
                    </div>
                  </div>
                )}

                {stats.remaining === 0 && stats.total > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-900">
                      All transactions are encrypted! Your data is secure.
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Migration Action Card */}
        {stats && stats.remaining > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Run Migration</CardTitle>
              <CardDescription>
                This will encrypt all your unencrypted transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">What will happen:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>All amounts will be encrypted using AES-256</li>
                  <li>All descriptions will be encrypted</li>
                  <li>Original plaintext will be kept for backward compatibility</li>
                  <li>No data will be deleted</li>
                  <li>The app will continue to work normally</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-900">
                  {error}
                </div>
              )}

              {isMigrating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Encrypting transactions...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {completed && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-900">
                  <CheckCircle2 className="h-5 w-5" />
                  Migration completed successfully!
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={migrateData}
                  disabled={isMigrating || completed}
                  className="flex-1"
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : completed ? (
                    "Migration Complete"
                  ) : (
                    `Encrypt ${stats.remaining} Transactions`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchStats}
                  disabled={isMigrating}
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Card */}
        {completed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verify Encryption
              </CardTitle>
              <CardDescription>
                Test encrypted data against backup to ensure integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!verification ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Verify that encryption worked correctly by testing 10 random transactions against the backup.
                  </p>
                  <Button
                    onClick={verifyEncryption}
                    disabled={isVerifying}
                    variant="outline"
                    className="w-full"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Run Verification
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`p-3 rounded-md border ${
                    verification.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {verification.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        verification.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {verification.success 
                          ? 'Verification Passed!' 
                          : 'Verification Issues Found'}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Tested: {verification.tested} transactions</p>
                      <p>Passed: {verification.passed}</p>
                      <p>Failed: {verification.failed}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Details:</h4>
                    <div className="text-xs space-y-1 p-3 bg-muted rounded-md max-h-48 overflow-y-auto font-mono">
                      {verification.details.map((detail, idx) => (
                        <div key={idx}>{detail}</div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={verifyEncryption}
                    disabled={isVerifying}
                    variant="outline"
                    size="sm"
                  >
                    Run Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• This migration is safe and can be run multiple times</p>
            <p>• Already encrypted transactions will be skipped</p>
            <p>• The process may take a few minutes for large datasets</p>
            <p>• Do not close this page during migration</p>
            <p>• After migration, run verification to ensure data integrity</p>
            <p>• Backup table is preserved for safety</p>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

