import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import AppView from '../AppView';
import BackArrow from '../icons/BackArrow';

const BackButton = ({ rounded = false, onPress }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ paddingHorizontal: 10 }}>
      {rounded ? (
        <AppView
          backgroundColor="white"
          width={34}
          height={34}
          borderWidth={1}
          borderRadius={17}
          borderColor="#2B2B2B"
          justifyContent="center"
          alignItems="center">
          <Svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <Circle cx="17" cy="17" r="16.5" stroke="#2B2B2B" />
            <Path
              d="M16.5385 22.5379L11 16.9994L16.5385 11.4609M11.7692 16.9994H23"
              stroke="#2B2B2B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </AppView>
      ) : (
        <BackArrow />
      )}
    </TouchableOpacity>
  );
};

export default BackButton;
