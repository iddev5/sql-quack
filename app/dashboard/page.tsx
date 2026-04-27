import Navbar from "@/components/navbar";

export default function Dashboard() {
  return <div className="bg-primary w-screen h-screen overflow-x-hidden">
    <Navbar />
    <div className="flex">
      <div className="w-[65%] h-screen bg-primary border-r border-[#30363D]">
        <div className="flex justify-between h-10 items-center px-4 border-b border-[#30363D] bg-[#181c22]">
          <div className="flex items-center gap-4">
            <p className="uppercase text-outline font-inter text-[11px] text-[#948ea1]">Problems</p>
          </div>
        </div>
      </div>
      <div className="w-[35%] h-screen bg-primary">
        <div className="w-full h-screen bg-primary border-r border-[#30363D]">
          <div className="flex justify-between h-10 items-center px-4 border-b border-[#30363D] bg-[#181c22]">
            <div className="flex items-center gap-4">
              <p className="uppercase text-outline font-inter text-[11px] text-[#948ea1]">Profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
}
