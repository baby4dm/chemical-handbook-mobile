import React, { useState } from 'react';
import { TouchableOpacity, SafeAreaView, Image, StyleSheet, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';

// Replace with your actual server URL
const OCR_SERVER_URL = 'http://10.138.134.126:8000/extract-text/';


interface PhotoPreviewSectionProps {
    photo: CameraCapturedPicture;
    handleRetakePhoto: () => void;
}

const PhotoPreviewSection: React.FC<PhotoPreviewSectionProps> = ({ photo, handleRetakePhoto }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSendPhoto = async () => {
        console.log("Send button pressed");
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: photo.uri,
                type: 'image/jpeg',
                name: 'upload.jpg',
            } as any);
    
            const response = await fetch(OCR_SERVER_URL, {
                method: 'POST',
                body: formData,
                // Remove Content-Type header; FormData handles it automatically
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }
    
            const data = await response.json();
            Alert.alert("Success", `Extracted text: ${data.text}`);
        } catch (error: unknown) {
            console.error("Error sending image to server:", error);
            // Check if error is an instance of Error
            const errorMessage = error instanceof Error ? error.message : "Failed to process the image. Please try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    

    console.log("Rendering PhotoPreviewSection");

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.box}>
                <View style={styles.previewContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="contain" />
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleRetakePhoto} disabled={isLoading}>
                        <Fontisto name="redo" size={24} color="white" />
                        <Text style={styles.buttonText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, styles.sendButton, isLoading && styles.disabledButton]} 
                        onPress={handleSendPhoto}
                        disabled={isLoading}
                    >
                        <Fontisto name="paper-plane" size={24} color="white" />
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" style={styles.activityIndicator} />
                        ) : (
                            <Text style={styles.buttonText}>Send</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    box: {
        flex: 1,
        borderRadius: 15,
        padding: 10,
        backgroundColor: 'darkgray',
        justifyContent: 'space-between',
        alignItems: "center",
    },
    previewContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 10,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: "space-around",
        width: '100%',
        paddingBottom: 20,
    },
    button: {
        backgroundColor: 'gray',
        borderRadius: 25,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        minWidth: 120,
    },
    sendButton: {
        backgroundColor: 'blue',
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 18,
    },
    activityIndicator: {
        marginLeft: 10,
    },
});

export default PhotoPreviewSection;
