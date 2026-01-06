import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export default function Notifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("All");
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase.from("tbldepartments").select("department_name");

      if (error) {
        toast({
          title: "Error loading departments",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setDepartments(data.map((d: any) => d.department_name));
      }
    };

    fetchDepartments();
  }, []);

  // ✅ Handle Send Notification
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ prevent form reload

    if (!title) {
      toast({
        title: "Missing title",
        description: "Please enter a notification title.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("tblnotifications").insert([
        {
          title,
          message,
          target_audience: target || "All",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Notification sent",
        description: "Your notification has been added successfully!",
      });

      setTitle("");
      setMessage("");
      setTarget("All");
    } catch (err: any) {
      toast({
        title: "Error sending notification",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex flex-col  max-w-[60vw] min-h-[calc(100vh-64px)] bg-gray-50  mx-auto mt-7 p-4 space-y-4"
      style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-900">Create Notification</h2>
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          className="bg-blue-900 border-blue-900 text-white hover:bg-blue-800"
        >
          ← Back 
        </Button>
      </div>

      <Input
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border-blue-900 focus:ring-0 focus:border-blue-900"
      />

      <Textarea
        placeholder="Enter Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border-blue-900 focus:ring-0 focus:border-blue-900"
      />

      <select
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="border border-black-900 rounded-lg px-3 py-2 bg-blue-900 text-white focus:outline-none focus:ring-0 w-full"
      >
        <option value="All">All Employees</option>
        {departments.map((dept, idx) => (
          <option key={idx} value={dept}>
            {dept} Department
          </option>
        ))}
      </select>

      <Button
        type="submit"
        disabled={loading}
        className="bg-blue-900 hover:bg-blue-800 text-white"
      >
        {loading ? "Sending..." : "Send Notification"}
      </Button>
    </form>
  );
}
