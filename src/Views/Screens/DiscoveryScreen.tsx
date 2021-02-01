import {useNavigation} from '@react-navigation/native';
import React, {createRef, memo, useEffect, useState} from 'react';
import {Platform, Dimensions, View} from 'react-native';
import {Modalize} from 'react-native-modalize';
import { StretchyScrollView } from 'react-native-stretchy';
import {useAnilistRequest} from '../../Hooks';
import {
  AnilistPagedData,
  AnilistPopularGraph,
  AnilistRequestTypes,
  AnilistSeasonalGraph,
  AnilistTrendingGraph,
} from '../../Models/Anilist';
import {useNotificationStore} from '../../Stores/notifications';
import {useTheme} from '../../Stores/theme';
import {MapKeyToPaths, MapRequestsToTitle} from '../../Util';
import {BaseRows, BaseRowsSimple, ThemedSurface} from '../Components';
import {InstagramAvatars} from '../Components/animated';
import BigCoverFlow, { BigCoverFlowText } from '../Components/bigCoverFlow';
import QueueTiles from '../Components/queueTiles';
import MyQueueScreen from './QueuePage';

const {height, width} = Dimensions.get('window');

const DiscoveryScreen = () => {
  const theme = useTheme((_) => _.theme);
  const notifications = useNotificationStore((_) => Object.values(_.notifications));

  const [data, setData] = useState<AnilistPagedData[]>([]);

  const queueModalize = createRef<Modalize>();
  const {
    query: {data: PopularData},
  } = useAnilistRequest<AnilistPagedData>('Popular', AnilistPopularGraph());
  const {
    query: {data: TrendingData},
  } = useAnilistRequest<AnilistPagedData>('Trending', AnilistTrendingGraph(), {
    refreshInterval: 3600000,
  });
  const {
    query: {data: SeasonalData},
  } = useAnilistRequest<AnilistPagedData>('Seasonal', AnilistSeasonalGraph());

  const canAdd = (type: AnilistRequestTypes): boolean => {
    const exists = data.find((i) => i.type === type);
    return exists === undefined;
  };
  useEffect(() => {
    if (PopularData && canAdd('Popular'))
      setData((list) => list.concat(PopularData));
    if (TrendingData && canAdd('Trending'))
      setData((list) => list.concat(TrendingData));
    if (SeasonalData && canAdd('Seasonal'))
      setData((list) => list.concat(SeasonalData));

  }, [PopularData, TrendingData, SeasonalData]);

  const discordID = 10721

  return (
    <>
      <ThemedSurface style={{flex: 1}}>
        <StretchyScrollView
        imageResizeMode={'center'}
        imageHeight={Platform.OS === 'ios' ? height * 0.45 : height * 0.47}
        image={require('../../assets/images/icon_round.png')}
        foreground={<BigCoverFlowText id={discordID}/>}
        imageOverlay={<BigCoverFlow id={discordID} />}
        >
        <View style={{backgroundColor: theme.colors.backgroundColor, marginTop: 10}}>
          <InstagramAvatars />

          {notifications.length > 0 && (
            <BaseRowsSimple
              title={'Following'}
              subtitle={"New episodes on anime you're following"}
              data={notifications}
            />
          )}
          <QueueTiles onPress={() => queueModalize.current?.open()}/>
          {[...data].map((i) => {
            const {title, subTitle} = MapRequestsToTitle.get(i.type)!;
            return (
              <BaseRows
                key={i.type}
                title={title}
                subtitle={subTitle}
                data={i}
                path={MapKeyToPaths.get(i.type)!}
                type={i.type}
              />
            );
          })}
          </View>
        </StretchyScrollView>
      </ThemedSurface>
      <Modalize ref={queueModalize} modalHeight={height * 0.75} modalStyle={{backgroundColor: theme.colors.backgroundColor}}>
        <View style={{flex: 1, overflow: 'hidden', borderTopRightRadius: 6, borderTopLeftRadius: 6}}>
        <MyQueueScreen />
        </View>
      </Modalize>
    </>
  );
};

export default memo(DiscoveryScreen);
