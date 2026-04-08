"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  KeyRound,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Props {
  hasFirm: boolean;
  isOwner: boolean;
}

export default function SettingsClient({
  hasFirm,
  isOwner,
}: Props) {
  const supabase = createClient();

  // ── Wachtwoord ────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [pwMessage, setPwMessage] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus("error");
      setPwMessage("De wachtwoorden komen niet overeen.");
      return;
    }
    if (newPassword.length < 8) {
      setPwStatus("error");
      setPwMessage("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }

    setPwLoading(true);
    setPwStatus("idle");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPwStatus("error");
      setPwMessage(error.message);
    } else {
      setPwStatus("success");
      setPwMessage("Wachtwoord succesvol gewijzigd.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPwLoading(false);
  };

  // ── Notificatie-email ─────────────────────────────────────────────────────
  const [notifEmail, setNotifEmail] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [emailMessage, setEmailMessage] = useState("");

  const handleEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailStatus("idle");

    const updates: Record<string, string> = {};
    if (notifEmail) updates.notification_email = notifEmail;
    if (ccEmail !== undefined) updates.cc_email = ccEmail;

    if (Object.keys(updates).length === 0) {
      setEmailStatus("error");
      setEmailMessage("Vul minimaal één e-mailadres in.");
      setEmailLoading(false);
      return;
    }

    const res = await fetch("/api/firms/me", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setEmailStatus("error");
      setEmailMessage(
        typeof json?.error === "string" && json.error
          ? json.error
          : "Opslaan mislukt."
      );
    } else {
      setEmailStatus("success");
      setEmailMessage("E-mailinstellingen opgeslagen.");
      setNotifEmail("");
      setCcEmail("");
    }
    setEmailLoading(false);
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Instellingen</h1>
        <p className="text-sm text-gray-500 mt-1">
          Beheer je accountinstellingen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Wachtwoord wijzigen */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-black">
                  Wachtwoord wijzigen
                </h2>
                <p className="text-xs text-gray-400">Minimaal 8 tekens</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nieuw wachtwoord
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bevestig nieuw wachtwoord
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {pwStatus !== "idle" && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                    pwStatus === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {pwStatus === "success" ? (
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {pwMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="btn-primary"
              >
                {pwLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {pwLoading ? "Opslaan…" : "Wachtwoord wijzigen"}
              </button>
            </form>
          </section>

          {/* Notificatie-email */}
          {hasFirm && isOwner && (
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-black">
                    E-mailinstellingen
                  </h2>
                  <p className="text-xs text-gray-400">
                    Ontvang sollicitaties op het juiste adres
                  </p>
                </div>
              </div>

              <form onSubmit={handleEmailSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primair notificatie-e-mailadres
                  </label>
                  <input
                    type="email"
                    placeholder="werkgever@voorbeeld.nl"
                    value={notifEmail}
                    onChange={(e) => setNotifEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Laat leeg om het huidige adres te bewaren
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extra CC-e-mailadres{" "}
                    <span className="text-gray-400 font-normal">
                      (optioneel)
                    </span>
                  </label>
                  <input
                    type="email"
                    placeholder="extra@werkgever.nl"
                    value={ccEmail}
                    onChange={(e) => setCcEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {emailStatus !== "idle" && (
                  <div
                    className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                      emailStatus === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {emailStatus === "success" ? (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    {emailMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailLoading || (!notifEmail && !ccEmail)}
                  className="btn-primary"
                >
                  {emailLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {emailLoading ? "Opslaan…" : "E-mailinstellingen opslaan"}
                </button>
              </form>
            </section>
          )}
      </div>

    </div>
  );
}
