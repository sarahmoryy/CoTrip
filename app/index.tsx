import { router } from 'expo-router';

import { getAuth } from 'firebase/auth';


export default function Index() {
  

  getAuth().onAuthStateChanged((user) => {
    if (!user)  router.replace('/login');
  });
  
  // const user = useSelector((state: { user: UserState }) => state.user);

  // // Redirect to /login if not authenticated, otherwise to /(tabs)/home
  // return user.full_name ? <Redirect href="/(tabs)/home" /> : <Redirect href="/login" />;
}