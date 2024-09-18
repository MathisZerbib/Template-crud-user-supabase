import React from "react";
import AuthLayout from "./layout/AuthLayout";

const LoadingScreen: React.FC = () => {
  return (
    <AuthLayout>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-solid rounded-full animate-spin border-t-transparent"></div>
      </div>
    </AuthLayout>
  );
};

export default LoadingScreen;
