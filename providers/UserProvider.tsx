"use client";

interface UserProviderProps {
  children: React.ReactNode;
}

const UserProvider:React.FC<UserProviderProps> = ({children}) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};

export default UserProvider;
