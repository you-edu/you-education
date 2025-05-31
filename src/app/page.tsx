"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchSubjects() {
    setError("");
    setLoading(true);
    setSubjects([]);
    if (!session) {
      setError("Please sign in.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch");
      } else {
        setSubjects(data);
      }
    } catch (e) {
      setError("Network error");
    }
    setLoading(false);
  }

  async function createSubject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!session) {
      setError("Please sign in.");
      return;
    }
    if (!title) {
      setError("Title is required");
      return;
    }
    try {
      const res = await fetch("/api/subjects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          title,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create subject");
      } else {
        setTitle("");
        setDescription("");
        fetchSubjects();
      }
    } catch (e) {
      setError("Network error");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Subject API Test</h1>
      {session ? (
        <>
          <div className="mb-2">
            <button onClick={() => signOut()} className="mr-2 px-2 py-1 bg-gray-200 rounded">
              Sign out
            </button>
            <button onClick={fetchSubjects} className="px-2 py-1 bg-blue-500 text-white rounded" disabled={loading}>
              {loading ? "Loading..." : "Get All Subjects"}
            </button>
          </div>
          <form onSubmit={createSubject} className="mb-4">
            <div>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border px-2 py-1 mr-2"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border px-2 py-1 mr-2"
              />
              <button type="submit" className="px-2 py-1 bg-green-500 text-white rounded">
                Create Subject
              </button>
            </div>
          </form>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <ul className="list-disc pl-5">
            {subjects.map((s: any) => (
              <li key={s._id}>
                <strong>{s.title}</strong> {s.description && <>- {s.description}</>}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button onClick={() => signIn()} className="px-2 py-1 bg-blue-500 text-white rounded">
            Sign in
          </button>
        </>
      )}
    </div>
  );
}
