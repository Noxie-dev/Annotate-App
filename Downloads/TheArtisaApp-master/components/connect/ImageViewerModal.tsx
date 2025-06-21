import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    GestureResponderEvent,
    Modal,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import AnnotationToolbar from './AnnotationToolbar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Annotation = {
  id: number;
  type: 'circle' | 'dot' | 'pen' | 'highlighter';
  x: number;
  y: number;
  radius?: number;
  color: string;
  lineWidth: number;
  points?: { x: number; y: number }[];
};

type ImageViewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialAnnotations?: Annotation[];
  onAnnotationsChange?: (annotations: Annotation[]) => void;
};

export default function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  initialAnnotations = [],
  onAnnotationsChange,
}: ImageViewerModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'highlighter' | 'circle' | 'dot' | 'pen'>('pointer');
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<Annotation | null>(null);
  const [showToolPanel, setShowToolPanel] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const imageRef = useRef<Image>(null);

  // Update parent with annotations
  useEffect(() => {
    if (onAnnotationsChange) {
      onAnnotationsChange(annotations);
    }
  }, [annotations, onAnnotationsChange]);

  // Get touch position relative to the image
  const getTouchPosition = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    return {
      x: locationX / zoomLevel,
      y: locationY / zoomLevel,
    };
  };

  // PanResponder for handling touch interactions
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        if (selectedTool === 'pointer') return;

        setIsDrawing(true);
        const { x, y } = getTouchPosition(event);
        const commonProps = {
          id: Date.now(),
          color: selectedTool === 'highlighter' ? '#FFFF00' : '#ef4444',
          lineWidth: selectedTool === 'highlighter' ? 10 : 2,
        };

        if (selectedTool === 'circle') {
          setCurrentDrawing({ ...commonProps, type: 'circle', x, y, radius: 0 });
        } else if (selectedTool === 'dot') {
          setAnnotations([...annotations, { ...commonProps, type: 'dot', x, y, radius: 4 }]);
          setIsDrawing(false);
        } else if (selectedTool === 'pen' || selectedTool === 'highlighter') {
          setCurrentDrawing({ ...commonProps, type: selectedTool, x, y, points: [{ x, y }] });
        }
      },
      onPanResponderMove: (event) => {
        if (!isDrawing || !currentDrawing) return;

        const { x, y } = getTouchPosition(event);

        if (currentDrawing.type === 'circle') {
          const radius = Math.sqrt(Math.pow(x - currentDrawing.x, 2) + Math.pow(y - currentDrawing.y, 2));
          setCurrentDrawing({ ...currentDrawing, radius });
        } else if (currentDrawing.type === 'pen' || currentDrawing.type === 'highlighter') {
          setCurrentDrawing(prev => {
            if (!prev || !prev.points) return prev;
            return { ...prev, points: [...prev.points, { x, y }] };
          });
        }
      },
      onPanResponderRelease: () => {
        if (!isDrawing || !currentDrawing) return;

        if (
          (currentDrawing.type !== 'dot' && currentDrawing.points && currentDrawing.points.length > 1) ||
          (currentDrawing.type === 'circle' && currentDrawing.radius && currentDrawing.radius > 0)
        ) {
          setAnnotations([...annotations, currentDrawing]);
        }

        setIsDrawing(false);
        setCurrentDrawing(null);
      },
      onPanResponderTerminate: () => {
        if (isDrawing) {
          setIsDrawing(false);
          setCurrentDrawing(null);
        }
      },
    })
  ).current;

  // Render annotations on SVG
  const renderAnnotations = () => {
    const allAnnotations = [...annotations];
    if (currentDrawing) allAnnotations.push(currentDrawing);

    return allAnnotations.map((annotation) => {
      switch (annotation.type) {
        case 'circle':
          return (
            <Circle
              key={annotation.id}
              cx={annotation.x}
              cy={annotation.y}
              r={annotation.radius || 0}
              stroke={annotation.color}
              strokeWidth={annotation.lineWidth / zoomLevel}
              fill="transparent"
            />
          );
        case 'dot':
          return (
            <Circle
              key={annotation.id}
              cx={annotation.x}
              cy={annotation.y}
              r={(annotation.radius || 4) / zoomLevel}
              fill={annotation.color}
            />
          );
        case 'pen':
        case 'highlighter':
          if (!annotation.points || annotation.points.length < 2) return null;

          let pathData = `M ${annotation.points[0].x} ${annotation.points[0].y}`;
          for (let i = 1; i < annotation.points.length; i++) {
            pathData += ` L ${annotation.points[i].x} ${annotation.points[i].y}`;
          }

          return (
            <Path
              key={annotation.id}
              d={pathData}
              stroke={annotation.color}
              strokeWidth={annotation.lineWidth / zoomLevel}
              strokeOpacity={annotation.type === 'highlighter' ? 0.3 : 1}
              fill="transparent"
            />
          );
        default:
          return null;
      }
    });
  };

  // Handle zoom in/out
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

  // Handle toolbar actions
  const handleToolbarAction = (actionName: string) => {
    if (actionName === 'scrollTop') {
      // Scroll to top logic
    } else if (actionName === 'scrollBottom') {
      // Scroll to bottom logic
    } else if (actionName === 'toggleFullScreen') {
      // Toggle fullscreen logic
    }
  };

  // Load image dimensions
  useEffect(() => {
    if (isOpen && imageUrl) {
      // Use default dimensions initially
      const defaultWidth = SCREEN_WIDTH * 0.9;
      const defaultHeight = SCREEN_HEIGHT * 0.6;

      setImageSize({
        width: defaultWidth,
        height: defaultHeight
      });

      // In a real implementation, you would use Image.getSize from react-native
      // to get the actual dimensions of the image
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop blur for iOS */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onClose}
          >
            <FontAwesome5 name="times" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowToolPanel(!showToolPanel)}
          >
            <FontAwesome5 name="bars" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Image and annotations */}
        <View style={styles.imageContainer}>
          <View
            style={[
              styles.imageWrapper,
              {
                transform: [{ scale: zoomLevel }],
                width: imageSize.width,
                height: imageSize.height,
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Image
              ref={imageRef}
              source={{ uri: imageUrl }}
              style={[
                styles.image,
                {
                  width: imageSize.width,
                  height: imageSize.height,
                },
              ]}
              contentFit="contain"
            />

            <Svg
              style={StyleSheet.absoluteFill}
              width={imageSize.width}
              height={imageSize.height}
            >
              {renderAnnotations()}
            </Svg>
          </View>
        </View>

        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomOut}
          >
            <FontAwesome5 name="search-minus" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Text>

          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
          >
            <FontAwesome5 name="search-plus" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Annotation toolbar */}
        {showToolPanel && (
          <View style={styles.toolbarContainer}>
            <AnnotationToolbar
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              onAction={handleToolbarAction}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topControls: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#000',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    color: '#FFFFFF',
    marginHorizontal: 12,
    fontSize: 14,
  },
  toolbarContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
});
