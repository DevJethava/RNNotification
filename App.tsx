/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
    Alert,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import notifee from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage.data);
});

function App(): JSX.Element {

    useEffect(() => {
        getFCMToken()

        const unsubscribe = messaging().onMessage(async remoteMessage => {
            onDisplayNotification(remoteMessage)
            Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage.data));
        });

        return unsubscribe;
    }, [])

    const getFCMToken = async () => {
        if (Platform.OS === 'android')
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
            console.log('Authorization status:', authStatus);
            const token = await messaging().getToken()
            console.log("FCM Token => ", token)
        }
    }

    async function onDisplayNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
        // Request permissions (required for iOS)
        await notifee.requestPermission()

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        // Display a notification
        await notifee.displayNotification({
            title: remoteMessage.notification?.title,
            body: remoteMessage.notification?.body,
            android: {
                channelId,
                //smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
                // pressAction is needed if you want the notification to open the app when pressed
                pressAction: {
                    id: 'default',
                },
            },
        });
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar
                barStyle={'light-content'}
            />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Demo</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

export default App;
