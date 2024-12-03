import UserDetails from "../components/MyAccount/UserDetails";

export default function page() {
  return (
    <div>
      {/* <div className="h-[60vh] bg-foreground flex-center relative overflow-hidden">
        <Image
          className="w-full"
          src={"/images/Banners/LoginPageBanner.jpg"}
          alt=""
          height={1200}
          width={1200}
        />
        <div className="size-full flex-center flex-col gap-y-1  absolute inset-0">
          <div className="size-24 bg-white rounded-full overflow-hidden">
            <Image
              className="size-full object-cover"
              src={"/images/studient-icon.jpg"}
              alt=""
              height={1200}
              width={1200}
            />
          </div>
          <div className="flex-center flex-col">
            <h2 className="text-background text-xl font-semibold">
              Somnath Gupta
            </h2>
            <h3 className="text-sm text-gray-400">somnathgupta112@gmail.com</h3>
          </div>
        </div>
      </div> */}

      {/* <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/LoginPageBanner.jpg"}
          alt="Contact Us Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000a6]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              My Account
            </h1>
            <span className="text-background text-sm">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/my-account"}>My Account</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full main-layout py-10">
        <TabMenu
          tabs={[
            {
              isSelected: true,
              text: "User Details",
              slug: "/my-account/user-details",
            },
            {
              isSelected: false,
              text: "Courses",
              slug: "/my-account/courses",
            },
            {
              isSelected: false,
              text: "library",
              slug: "/my-account/library",
            },
          ]}
        />

        <div className="mt-5">
          <div className="flex items-start pb-5">
            <div className="size-28 bg-slate-200 rounded-xl shadow-lg overflow-hidden">
              <Image
                src={"/images/studient-icon.jpg"}
                alt="Student Profile Image"
                height={1200}
                width={1200}
              />
            </div>
            <div className="px-5 *:block space-y-2">
              <span className="font-medium text-xl">Student Image</span>
              <span>The proposed size 350px * 180px no bigger then 2.5mb</span>

              <div className="grid grid-cols-2">
                <Button className="!bg-foreground !py-2 !min-w-28 !text-sm">
                  Change Image
                </Button>
              </div>
            </div>
          </div>
          <form className="grid grid-cols-2 gap-5">
            <Input
              className="!rounded-md"
              label="Your name"
              placeholder="Somnath Gupta"
            />
            <Input
              className="!rounded-md"
              label="Your Email"
              placeholder="somnathgupta@gmail.com"
            />
            <Input
              type="date"
              className="!rounded-md"
              label="Your Date Of Birth"
              placeholder="Somnath Gupta"
            />
            <Input
              type="text"
              className="!rounded-md"
              label="Your Mobile Number"
              placeholder="8784589878"
            />

            <Button className="bg-[#E9B858] !text-foreground !border-none !w-60">
              Update Details
            </Button>
          </form>
        </div>
      </div> */}

      <UserDetails />
    </div>
  );
}
