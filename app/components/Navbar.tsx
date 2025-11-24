import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useState } from "react";

const Navbar = () => {
    const { auth } = usePuterStore();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await auth.signOut();
        } finally {
            setLoading(false); // always end loading
        }
    };

    return (
        <>
            <nav className="flex justify-between items-center w-full px-4">
                <div className="navbar bg-white rounded-full px-6 py-2 flex items-center gap-6">
                    <Link to="/">
                        <p className="text-2xl font-bold text-gradient">RESUMEMATCH</p>
                    </Link>

                    <Link to="/upload" className="primary-button w-fit">
                        Upload Resume
                    </Link>
                </div>

                <button
                    className="logout-button text-gray-400 text-[16px] px-3 py-1 leading-none cursor-pointer hover:text-gray-500"
                    onClick={handleLogout}
                >
                    Log Out
                </button>
            </nav>

            {/* loading */}
            {loading && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300 border-t-blue-600"></div>
                </div>
            )}
        </>
    );
};

export default Navbar;
