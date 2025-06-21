import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type AnnotationToolbarProps = {
  selectedTool: 'pointer' | 'highlighter' | 'circle' | 'dot' | 'pen';
  onSelectTool: (tool: 'pointer' | 'highlighter' | 'circle' | 'dot' | 'pen') => void;
  onAction: (action: string) => void;
};

export default function AnnotationToolbar({
  selectedTool,
  onSelectTool,
  onAction,
}: AnnotationToolbarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  const tools = [
    { name: 'pointer', icon: 'hand-pointer', label: 'Pointer Tool' },
    { name: 'highlighter', icon: 'highlighter', label: 'Highlighter Tool' },
    { name: 'circle', icon: 'circle', label: 'Circle Tool' },
    { name: 'dot', icon: 'dot-circle', label: 'Red Dot Tool' },
    { name: 'pen', icon: 'pen', label: 'Pen Tool' },
  ];
  
  const actions = [
    { name: 'scrollTop', icon: 'arrow-up', label: 'Scroll to Top' },
    { name: 'scrollBottom', icon: 'arrow-down', label: 'Scroll to Bottom' },
    { name: 'toggleFullScreen', icon: 'expand', label: 'Toggle Full Screen Image' },
  ];
  
  return (
    <View style={styles.container}>
      {tools.map((tool) => (
        <TouchableOpacity
          key={tool.name}
          onPress={() => onSelectTool(tool.name as any)}
          style={[
            styles.toolButton,
            selectedTool === tool.name ? styles.selectedToolButton : null,
          ]}
          accessibilityLabel={tool.label}
        >
          {tool.name === 'dot' ? (
            <View style={styles.dotIcon} />
          ) : (
            <FontAwesome5
              name={tool.icon}
              size={20}
              color="#FFFFFF"
              solid={tool.name === 'dot'}
            />
          )}
        </TouchableOpacity>
      ))}
      
      <View style={styles.divider} />
      
      {actions.map((action) => (
        <TouchableOpacity
          key={action.name}
          onPress={() => onAction(action.name)}
          style={styles.actionButton}
          accessibilityLabel={action.label}
        >
          <FontAwesome5
            name={action.icon}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    backgroundColor: '#1F2937', // gray-800
    paddingVertical: 16,
    alignItems: 'center',
    height: '100%',
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#374151', // gray-700
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedToolButton: {
    backgroundColor: '#2563EB', // blue-600
  },
  dotIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // red-500
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#4B5563', // gray-600
    marginVertical: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#374151', // gray-700
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});
