import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import '../globals.css';
import { UserService } from '../store/all';
import { store } from '../store/store';
import { clearUser, UserState } from '../store/userSlice';

function useProtectedRoute() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: { user: UserState }) => state.user);

  useEffect(() => {
    if (!user.full_name) {
      // Run navigation *after* mount
      setTimeout(() => {
        router.replace('/login');
      }, 0);
    }
  }, [user.full_name, router]);

  useEffect(() => {
    const handleLogout = async () => {
      await UserService.logout();
      dispatch(clearUser());
      router.replace('/login');
    };
  }, [dispatch, router]);
}

function ProtectedLayout() {
  useProtectedRoute();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ProtectedLayout />
    </Provider>
  );
}
