import { useEffect, useState } from "react";
import { MdOutlineWorkOutline } from "react-icons/md";
import { TiStarOutline } from "react-icons/ti";
import { TiStarFullOutline } from "react-icons/ti";
import { getCurrentTechnician } from "../../api/technicians";
import type { TechnicianProfile } from "../../types/technician";
import Input from "../../components/ui/Input";

type Props = {
  editMode?: boolean;
  profile?: TechnicianProfile | null;
  draftBio?: string;
  setDraftBio?: (v: string) => void;
  draftYears?: string;
  setDraftYears?: (v: string) => void;
};

export default function Overview({ editMode, profile: profileProp, draftBio, setDraftBio, draftYears, setDraftYears }: Props) {
  const totalStars = 5; 
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Local mirrors for display when not editing (parent drafts drive edit UI)

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentTechnician();
        setProfile(me);
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6 mb-8 ">
      
      <div className="bg-white rounded-2xl p-6 border border-gray-300">
        <h3 className="text-lg font-semibold mb-2">Professional Bio</h3>
        {editMode ? (
          <div>
            <label className="block w-full">
              <span className="block mb-1 text-sm font-medium text-gray-700">Bio</span>
              <textarea
                className="w-full bg-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 min-h-[120px]"
                placeholder="Tell employers about your experience, specialties, and strengths"
                value={draftBio || ""}
                onChange={(e) => setDraftBio && setDraftBio(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <p className="text-gray-900 text-sm leading-relaxed">
            {(profileProp || profile)?.bio || "Add a short bio to describe your experience and specialties."}
          </p>
        )}
      </div>

     
      <div className="flex gap-4 flex-wrap">
       
        <div className="flex-1 min-w-[200px] bg-white rounded-2xl p-6 shadow-sm border border-gray-300">
          <div className="flex items-center gap-2 mb-2 text-black">
            <MdOutlineWorkOutline className="text-xl" />
            <h4 className="font-semibold text-md">Experience</h4>
          </div>
          {editMode ? (
            <div className="max-w-[220px]">
              <Input label="Years" type="number" min={0} value={draftYears || ""} onChange={(e) => setDraftYears && setDraftYears(e.target.value)} />
            </div>
          ) : (
            <p className="text-black font-semibold text-sm">{(profileProp || profile)?.years_experience ?? 0} Years</p>
          )}
        </div>

        
        <div className="flex-1 min-w-[200px] bg-white rounded-2xl p-6 shadow-sm border border-gray-300">
          <div className="flex items-center gap-2 mb-2 text-black">
            <TiStarOutline className="text-xl" />
            <h4 className="font-semibold text-black text-md">Rating</h4>
          </div>

         
          <div className="flex items-center gap-1 mb-2 text-yellow-500">
            {Array.from({ length: totalStars }).map((_, index) => (
              <TiStarFullOutline key={index} />
            ))}
            <span className="text-black font-bold">{profile?.rating_avg ?? 0}</span>
            <span className="text-gray-500"> ({profile?.rating_count ?? 0} Reviews)</span>
          </div>

        </div>
      </div>

      
    </div>
  );
}
