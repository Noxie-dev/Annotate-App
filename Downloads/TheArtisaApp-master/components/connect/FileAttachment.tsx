import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type FileAttachmentProps = {
  fileName: string;
  fileSize?: number;
  fileType?: string;
  onPress: () => void;
};

export default function FileAttachment({
  fileName,
  fileSize,
  fileType,
  onPress,
}: FileAttachmentProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  // Helper function to get file icon based on file type
  const getFileIcon = () => {
    if (!fileType) return 'file';
    
    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('word') || fileType.includes('doc')) return 'file-word';
    if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('csv')) return 'file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'file-powerpoint';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'file-archive';
    if (fileType.includes('text')) return 'file-alt';
    
    return 'file';
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: isDark ? '#4b5563' : '#e5e7eb' }
      ]}>
        <FontAwesome5
          name={getFileIcon()}
          size={24}
          color={isDark ? Colors.dark.text : Colors.light.text}
        />
      </View>
      
      <View style={styles.fileInfo}>
        <Text
          style={[
            styles.fileName,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}
          numberOfLines={1}
        >
          {fileName}
        </Text>
        
        {fileSize && (
          <Text
            style={[
              styles.fileSize,
              { color: isDark ? '#9ca3af' : '#6b7280' }
            ]}
          >
            {formatFileSize(fileSize)}
          </Text>
        )}
      </View>
      
      <FontAwesome5
        name="download"
        size={16}
        color={isDark ? '#9ca3af' : '#6b7280'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
  },
});
