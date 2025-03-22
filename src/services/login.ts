import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userLoginSetToken = async () => {
  try {
    const authRes = await axios.post(
      'https://96318a87-0588-4da5-9843-b3d7919f1782.mock.pstmn.io/sign-in-request',
      {
        email: 'salar@beije.co',
        password: 'beijeApp',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const token = authRes.data.data.token;
    await AsyncStorage.setItem('token', token);
    return token;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
};
