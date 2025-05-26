import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ubuntu-blue-50 to-ubuntu-blue-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-ubuntu-blue-200">
          <h1 className="text-3xl font-bold text-ubuntu-blue-800 mb-4 font-ubuntu">
            Welcome to File Chat Dashboard
          </h1>
          <p className="text-ubuntu-cool-grey mb-8">
            You have successfully logged in! This is where your document collaboration features will be available.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-ubuntu-blue-50 rounded-lg p-6 border border-ubuntu-blue-200">
              <h3 className="text-lg font-semibold text-ubuntu-blue-800 mb-2">Documents</h3>
              <p className="text-ubuntu-cool-grey">Manage your collaborative documents</p>
            </div>

            <div className="bg-ubuntu-orange/10 rounded-lg p-6 border border-ubuntu-orange/20">
              <h3 className="text-lg font-semibold text-ubuntu-orange mb-2">Recent Activity</h3>
              <p className="text-ubuntu-cool-grey">View your recent collaboration activity</p>
            </div>

            <div className="bg-ubuntu-purple/10 rounded-lg p-6 border border-ubuntu-purple/20">
              <h3 className="text-lg font-semibold text-ubuntu-purple mb-2">Settings</h3>
              <p className="text-ubuntu-cool-grey">Configure your account preferences</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
