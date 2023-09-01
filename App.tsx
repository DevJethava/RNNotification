/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
    Alert,
    Button,
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
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

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

    async function onShowNotification() {
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        // Required for iOS
        // See https://notifee.app/react-native/docs/ios/permissions
        await notifee.requestPermission();

        const notificationId = await notifee.displayNotification({
            id: '123',
            title: 'Test Notification',
            body: 'This is Testing of Local Notification in Device.',
            android: {
                channelId,
            },
        });

        // Show Badge count in iOS
        // if (Platform.OS === 'ios') {
        //     notifee.setBadgeCount(0).then(() => console.log('Badge count set!'));
        // }

        // Sometime later...
        // await notifee.displayNotification({
        //     id: '123',
        //     title: 'Updated Notification Title',
        //     body: 'Updated main body content of the notification',
        //     android: {
        //         channelId,
        //     },
        // });
    }

    const requestPermission = () => {
        request(Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
            .then((result) => {
                // setPermissionResult(result)
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        console.log('This feature is not available (on this device / in this context)');
                        break;
                    case RESULTS.DENIED:
                        console.log('The permission has not been requested / is denied but requestable');
                        break;
                    case RESULTS.LIMITED:
                        console.log('The permission is limited: some actions are possible');
                        break;
                    case RESULTS.GRANTED:
                        console.log('The permission is granted');
                        break;
                    case RESULTS.BLOCKED:
                        console.log('The permission is denied and not requestable anymore');
                        break;
                }
            })
            .catch((error) => {
                console.log({ error });
            });
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar
                barStyle={'light-content'}
            />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Demo</Text>
                <Button title='Send Local Notification' onPress={onShowNotification} />
                <Button title='Permission' onPress={requestPermission} />
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
