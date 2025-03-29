import Image from 'next/image';

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm text-center">
        <Image
          src="/profile-placeholder.png"
          alt="Profile Picture"
          width={100}
          height={100}
          className="rounded-full mx-auto"
        />
        <h2 className="text-xl font-semibold mt-4">John Doe</h2>
        <p className="text-gray-600">Software Engineer</p>
        <p className="text-gray-500 text-sm mt-2">johndoe@example.com</p>

        <div className="mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
