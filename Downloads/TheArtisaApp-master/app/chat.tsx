import { FontAwesome5 } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Message type definition
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm Handy-Andy, your virtual assistant. How can I help you find the right service today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm looking for services that match your needs. Could you tell me more about what you're looking for?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`max-w-[80%] p-3 rounded-2xl mb-2 ${
        item.isUser
          ? 'bg-orange-500 self-end rounded-br-sm'
          : 'bg-gray-100 self-start rounded-bl-sm'
      }`}
    >
      <Text
        className={`text-base ${item.isUser ? 'text-white' : 'text-gray-800'}`}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chat with Andy',
          headerBackTitleVisible: false,
        }}
      />
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          inverted={false}
        />
        <View
          className="flex-row p-2 border-t border-gray-200 items-center bg-white"
        >
          <TextInput
            className="flex-1 p-2.5 text-base text-gray-800 max-h-24"
            placeholder="Type a message..."
            placeholderTextColor="#687076"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-orange-500 justify-center items-center ml-2"
            onPress={handleSend}
            disabled={inputText.trim() === ''}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="paper-plane" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}


