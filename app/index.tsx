import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { UserState } from '../store/userSlice';

export default function Index() {
  const user = useSelector((state: { user: UserState }) => state.user);

  // Redirect to /login if not authenticated, otherwise to /(tabs)/home
  return user.full_name ? <Redirect href="/(tabs)/home" /> : <Redirect href="/login" />;
}