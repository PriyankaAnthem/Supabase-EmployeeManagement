import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface tblpasswordresets {
  id: string;
  email: string;
  employee_id: number;
  status: string;
  created_at: string | null;
}

const Requests = () => {
  const [pendingRequests, setPendingRequests] = useState<tblpasswordresets[]>([]);
  const [otherRequests, setOtherRequests] = useState<tblpasswordresets[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tblpasswordresets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const pending = (data || []).filter((req) => req.status === "Pending");
      const others = (data || []).filter((req) => req.status !== "Pending");

      setPendingRequests(pending);
      setOtherRequests(others);
    } catch (err) {
      console.error("Error fetching requests:", err);
      toast({
        title: "Error",
        description: "Failed to load requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req: tblpasswordresets) => {
    const { error } = await supabase
      .from("tblpasswordresets")
      .update({ status: "Approved" })
      .eq("id", req.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Request Approved",
      description: `Password reset request for ${req.email} has been approved.`,
    });

    fetchRequests();
  };

  const handleReject = async (req: tblpasswordresets) => {
    const { error } = await supabase
      .from("tblpasswordresets")
      .update({ status: "Rejected" })
      .eq("id", req.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Request Rejected",
      description: `Password reset request for ${req.email} was rejected.`,
      variant: "destructive",
    });

    fetchRequests();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#001F7A] tracking-tight mb-2">
          Password Reset Requests
        </h1>
        <p className="text-gray-500">
          Manage and track all employee password reset requests.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-[#001F7A]" size={40} />
        </div>
      ) : (
        <>
          {/* 🟡 Pending Requests */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-[#001F7A] mb-4">
              Pending Requests
            </h2>

            {pendingRequests.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map((req) => (
                  <Card
                    key={req.id}
                    className="border-none shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #ffffff, #e5e9ff)",
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[#001F7A] text-lg">
                        {req.email}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Status:</span>{" "}
                        <span className="text-yellow-600">{req.status}</span>
                      </p>
                      {req.created_at && (
                        <p className="text-xs text-gray-500 mb-3">
                          Requested on:{" "}
                          {new Date(req.created_at).toLocaleString()}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(req)}
                          className="bg-blue-900 hover:bg-blue-900 text-white flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(req)}
                          variant="destructive"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 p-6 text-center rounded-xl">
                <p className="text-gray-600">No new pending requests.</p>
              </div>
            )}
          </section>

          {/* 🟦 Processed Requests */}
          <section>
            <h2 className="text-xl font-semibold text-[#001F7A] mb-4">
              Processed Requests
            </h2>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
              <table className="min-w-full text-sm text-left">
                <thead
                  className="bg-gradient-to-r from-[#e5e9ff] to-[#c9d0fb]"
                >
                  <tr className="text-[#001F7A]">
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Requested On</th>
                  </tr>
                </thead>
                <tbody>
                  {otherRequests.length > 0 ? (
                    otherRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="border-b last:border-0 hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-3">{req.email}</td>
                        <td
                          className={`px-5 py-3 font-medium ${
                            req.status === "Approved"
                              ? "text-green-600"
                              : req.status === "Rejected"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {req.status}
                        </td>
                        <td className="px-5 py-3">
                          {req.created_at
                            ? new Date(req.created_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center text-gray-500 py-6"
                      >
                        No processed requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Requests;
