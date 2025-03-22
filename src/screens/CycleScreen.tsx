import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  LayoutAnimation,
} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {useSelector} from 'react-redux';
import {RootState, MenstruationDay, Insight} from '../redux/types';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

const {width} = Dimensions.get('window');
const size = width - 80;

const CycleScreen = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%'], []);

  const [sheetIndex, setSheetIndex] = useState<number>(0);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedDotIndex, setSelectedDotIndex] = useState<number | null>(null);

  const arcTranslateY = useRef(new Animated.Value(0)).current;
  const dateTranslateY = useRef(new Animated.Value(0)).current;
  const dotScales = useRef<Animated.Value[]>([]).current;

  const insights = useSelector((state: RootState) => state.insights);
  const menstruation = useSelector((state: RootState) => state.menstruation);
  const profile = useSelector((state: RootState) => state.profile);

  const dummyData: MenstruationDay[] = Array.from({length: 28}, (_, i) => ({
    date: `2025-02-${i + 1}`,
    type: i < 4 || i >= 25 ? 'FERTILITY' : 'BLEEDING',
    note: `Note for day ${i + 1}`,
  }));

  const menstruationDays =
    menstruation?.menstrationDays && menstruation.menstrationDays.length > 0
      ? menstruation.menstrationDays
      : dummyData;

  const todayIndex = 12;
  const todayType = menstruationDays[todayIndex]?.type;

  useEffect(() => {
    if (menstruationDays.length > 0 && dotScales.length === 0) {
      menstruationDays.forEach(() => {
        dotScales.push(new Animated.Value(1));
      });
    }
  }, [menstruationDays, dotScales]);

  const getTintColor = (type?: string) => {
    switch (type) {
      case 'BLEEDING':
        return 'rgba(240,106,71,0.1)';
      case 'FERTILITY':
        return 'rgba(140,217,195,0.1)';
      case 'OVULATION':
        return 'rgba(30,158,115,0.1)';
      default:
        return 'rgba(224,224,224,0.1)';
    }
  };

  const getDotColor = (type?: string) => {
    switch (type) {
      case 'BLEEDING':
        return '#F06A47';
      case 'FERTILITY':
        return '#8CD9C3';
      case 'OVULATION':
        return '#1E9E73';
      default:
        return '#E0E0E0';
    }
  };

  const groupedDays = menstruationDays.reduce(
    (
      acc: Record<string, Array<MenstruationDay & {index: number}>>,
      day,
      index,
    ) => {
      const type = day.type || 'default';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({index, ...day});
      return acc;
    },
    {},
  );

  const animateArc = (toValue: number) => {
    Animated.timing(arcTranslateY, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateDate = (toValue: number) => {
    Animated.timing(dateTranslateY, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateDots = (selectedIdx?: number) => {
    const animations = menstruationDays.map(
      (_: MenstruationDay, idx: number) => {
        const toValue =
          selectedIdx !== undefined && idx === selectedIdx ? 2 : 1;
        return Animated.timing(dotScales[idx], {
          toValue,
          duration: 300,
          useNativeDriver: true,
        });
      },
    );
    Animated.parallel(animations).start();
  };

  const handleSheetChanges = useCallback(
    (index: number) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSheetIndex(index);
      if (index === 1) {
        animateArc(-50);
        animateDate(-50);
        if (selectedDotIndex !== null) {
          animateDots(selectedDotIndex);
        } else {
          animateDots();
        }
      } else {
        animateArc(0);
        animateDate(0);

        const animations = menstruationDays.map(
          (_: MenstruationDay, idx: number) =>
            Animated.timing(dotScales[idx], {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
        );
        Animated.parallel(animations).start();
        setSelectedNote(null);
        setSelectedDotIndex(null);
      }
    },
    [dotScales, menstruationDays, selectedDotIndex],
  );

  const renderGroupedDots = () => {
    const totalDays = menstruationDays.length || 28;
    return (
      <View style={styles.groupWrapper}>
        {Object.keys(groupedDays).map(type => (
          <View key={type}>
            {groupedDays[type].map(({index, ...day}) => {
              const angle = (2 * Math.PI * index) / totalDays - Math.PI / 2;
              const radius = (size - 50) / 2;
              const cx = size / 2 + radius * Math.cos(angle);
              const cy = size / 2 + radius * Math.sin(angle);
              const dotColor = getDotColor(day.type);
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dotWrapper,
                    {
                      left: cx - 10,
                      top: cy - 10,
                      transform: [{scale: dotScales[index] || 1}],
                    },
                  ]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      if (sheetIndex !== 1) {
                        bottomSheetRef.current?.snapToIndex(1);
                      }
                      setSelectedDotIndex(index);
                      setSelectedNote(day.note || '');
                      animateDots(index);
                    }}>
                    <View style={[styles.dot, {backgroundColor: dotColor}]} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.profileInfo.firstName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationIcon}>
          <Image
            source={require('../assets/pngs/bell.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
      </View>

      <View style={{position: 'absolute', top: 216, left: '85%'}}>
        <Image
          source={require('../assets/pngs/Color.png')}
          width={158}
          height={162}
        />
      </View>

      <View style={{position: 'absolute', top: 125, right: '80%'}}>
        <Image
          source={require('../assets/pngs/Color1.png')}
          width={158}
          height={162}
        />
      </View>

      <View style={{position: 'absolute', bottom: '25%', right: '90%'}}>
        <Image
          source={require('../assets/pngs/08.png')}
          width={94}
          height={96}
        />
      </View>

      <Animated.View>
        <Animated.Text
          style={[
            styles.dateText,
            {transform: [{translateY: dateTranslateY}]},
          ]}>
          13 Ekim
        </Animated.Text>
      </Animated.View>
      <View
        style={[
          styles.dotGroupWrapper,
          {backgroundColor: getTintColor(todayType)},
        ]}>
        <Animated.View
          style={[
            styles.circleWrapper,
            {transform: [{translateY: arcTranslateY}]},
          ]}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={(size - 50) / 2}
              stroke="#fff"
              strokeWidth={50}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          {renderGroupedDots()}
        </Animated.View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemWrapper}>
          <Image
            source={require('../assets/pngs/innercircle.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navItemActive}>Döngü</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemWrapper}>
          <Image
            source={require('../assets/pngs/hug.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navItem}>Takvim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemWrapper}>
          <Image
            source={require('../assets/pngs/barchart.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navItem}>Analiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemWrapper}>
          <Image
            source={require('../assets/pngs/eye.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navItem}>Rehber</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        handleIndicatorStyle={{
          backgroundColor: 'rgba(105,105,105,1)',
          width: 40,
          height: 5,
          borderRadius: 24,
          opacity: 0.2,
        }}
        containerStyle={styles.bottomSheetContainer}>
        <BottomSheetView style={styles.bottomSheetContent}>
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={styles.insightsContainer}
            showsVerticalScrollIndicator={false}>
            <Text
              style={[
                styles.bottomSheetTitle,
                sheetIndex === 1 && {marginTop: 20},
              ]}>
              Bugün Öne Çıkanlar
            </Text>
            {selectedNote && (
              <Text style={styles.selectedNoteText}>{selectedNote}</Text>
            )}
            {insights?.length > 0 ? (
              insights.map((insight: Insight) => (
                <View key={insight._id} style={styles.insightItem}>
                  <Image
                    source={require('../assets/pngs/illustration.png')}
                    style={styles.insightIcon}
                  />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text numberOfLines={2} style={styles.insightContent}>
                      {insight.content}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noInsightsContainer}>
                <Text style={styles.noInsightsText}>
                  Henüz öne çıkan bir içerik yok
                </Text>
              </View>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDECE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#F06A47',
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  notificationIcon: {
    backgroundColor: 'white',
    width: 42.5,
    height: 42.5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotGroupWrapper: {
    borderRadius: 999,
    padding: 20,
  },
  circleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: size,
    height: size,
  },
  groupWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  dotWrapper: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 50,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: 'white',
    zIndex: 20,
  },
  navItemWrapper: {
    alignItems: 'center',
    paddingBottom: 10,
    justifyContent: 'center',
  },
  navIcon: {
    width: 20,
    height: 20,
    marginBottom: 5,
  },
  navItemActive: {
    color: '#F06A47',
    fontWeight: 'bold',
  },
  navItem: {
    color: '#999',
  },
  bottomSheetContainer: {
    marginBottom: 60,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedNoteText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  insightsContainer: {
    padding: 14,
    zIndex: 50,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  insightIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(177,177,177,1)',
  },
  insightContent: {
    fontSize: 18,
    color: 'black',
    fontWeight: '400',
    maxWidth: '95%',
  },
  noInsightsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noInsightsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default CycleScreen;
