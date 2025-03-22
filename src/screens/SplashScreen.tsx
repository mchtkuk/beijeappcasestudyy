import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {setProfile} from '../redux/profileSlice';
import {setMenstruationDays} from '../redux/menstruationSlice';
import {setInsights} from '../redux/insightsSlice';
import {userLoginSetToken} from '../services/login';

const SplashScreen = ({navigation}: any) => {
  const animation = useRef<LottieView>(null);
  const dispatch = useDispatch();
  const [animationCount, setAnimationCount] = useState(0);
  const [apiCompleted, setApiCompleted] = useState(false);

  const fetchData = async (token: any, dispatch: any, setApiCompleted: any) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const [profileRes, menstruationRes, insightsRes] = await Promise.all([
        axios.get(
          'https://96318a87-0588-4da5-9843-b3d7919f1782.mock.pstmn.io/profile',
          {headers},
        ),
        axios.get(
          'https://96318a87-0588-4da5-9843-b3d7919f1782.mock.pstmn.io/menstruation-days',
          {headers},
        ),
        axios.get(
          'https://96318a87-0588-4da5-9843-b3d7919f1782.mock.pstmn.io/insights',
          {headers},
        ),
      ]);
      dispatch(setProfile(profileRes.data.data));
      dispatch(setMenstruationDays(menstruationRes.data.data));
      dispatch(setInsights(insightsRes.data.data));
      setApiCompleted(true);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  useEffect(() => {
    animation.current?.play();
  }, [dispatch]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let token = await AsyncStorage.getItem('token');
        if (!token) {
          token = await userLoginSetToken();
        }

        if (token) {
          fetchData(token, dispatch, setApiCompleted);
        } else {
          console.error('Token retrieval failed.');
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    initializeAuth();
  }, [dispatch]);

  const handleAnimationFinish = () => {
    const count = animationCount + 1;
    setAnimationCount(count);

    if (count >= 3 && apiCompleted) {
      navigation.replace('CycleScreen');
    } else {
      animation.current?.play();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.animationWrapper}>
        <LottieView
          ref={animation}
          source={require('../assets/animations/splash.json')}
          loop={false}
          onAnimationFinish={handleAnimationFinish}
          style={styles.lottie}
        />
      </View>

      <Text style={styles.brand}>beije.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
  },
  brand: {
    position: 'absolute',
    bottom: 50,
    fontSize: 34,
    fontWeight: '500',
    color: '#F06A47',
  },
});

export default SplashScreen;
