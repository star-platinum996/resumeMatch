import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeMatch" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes()
  }, []);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true); // 如果你想加 loading
    try {
      // 先读取所有文件
      const files = (await fs.readDir("./")) as FSItem[];

      // 删除每个文件
      for (const file of files) {
        await fs.delete(file.path);
      }

      // 清空 KV
      await kv.flush();

      // 刷新简历列表
      const resumesKV = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes = resumesKV?.map((item) =>
          JSON.parse(item.value) as Resume
      );
      setResumes(parsedResumes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setShowWipeModal(false);
    }
  };

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <div className="flex items-center justify-between px-4">
      <Navbar />

    </div>

    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Applications & Resume Ratings</h1>
        {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
        ): (
          <h2>Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>
      {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
      )}

      {!loadingResumes && resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
      )}

      {/* wipe history window */}
      {showWipeModal && (
          <div className="fixed inset-0 bg-gray-100/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-blue-50 p-8 rounded-xl shadow-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Wipe</h2>
              <p className="text-blue-800 mb-6">
                This action will delete all resume analysis history. Once confirmed, it cannot be undone.
                Please make sure you have backed up any important data.
              </p>
              {/* wipe button */}
              <div className="flex justify-between mt-6 gap-4">
                <button
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    onClick={handleDelete}
                    disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Confirm"}
                </button>


                <button
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                    onClick={() => setShowWipeModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
      )}

      {/* if there is resume, show wipe button */}
      {!loadingResumes && resumes.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12 pb-12">
            <button
                onClick={() => setShowWipeModal(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition"
            >
              Wipe resume analyze history
            </button>
          </div>
      )}


    </section>
  </main>
}
