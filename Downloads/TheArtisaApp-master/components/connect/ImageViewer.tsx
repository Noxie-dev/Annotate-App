import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Text,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ImageViewerProps = {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
};

export default function ImageViewer({
  visible,
  imageUrl,
  onClose,
}: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const imageScale = useSharedValue(1);
  
  // Pan gesture for moving the image
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      // Reset position with animation
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    });
  
  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      imageScale.value = Math.max(1, Math.min(event.scale * scale, 5));
    })
    .onEnd(() => {
      // Save the final scale
      setScale(imageScale.value);
    });
  
  // Double tap gesture for resetting zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (imageScale.value > 1) {
        // Reset to original size
        imageScale.value = withTiming(1);
        setScale(1);
      } else {
        // Zoom in to 2x
        imageScale.value = withTiming(2);
        setScale(2);
      }
    });
  
  // Combine gestures
  const composedGestures = Gesture.Simultaneous(
    panGesture,
    Gesture.Exclusive(pinchGesture, doubleTapGesture)
  );
  
  // Animated styles
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: imageScale.value },
      ],
    };
  });
  
  // Handle zoom in
  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.5, 5);
    imageScale.value = withTiming(newScale);
    setScale(newScale);
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.5, 1);
    imageScale.value = withTiming(newScale);
    setScale(newScale);
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <FontAwesome5 name="times" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.zoomControls}>
            <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={handleZoomOut}
              disabled={scale <= 1}
            >
              <FontAwesome5
                name="search-minus"
                size={18}
                color={scale <= 1 ? 'rgba(255,255,255,0.5)' : '#ffffff'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={handleZoomIn}
              disabled={scale >= 5}
            >
              <FontAwesome5
                name="search-plus"
                size={18}
                color={scale >= 5 ? 'rgba(255,255,255,0.5)' : '#ffffff'}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.imageContainer}>
          <GestureDetector gesture={composedGestures}>
            <Animated.View style={animatedImageStyle}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoomText: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: 12,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
});
