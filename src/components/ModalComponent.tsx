import React, { useState } from 'react'
import { ActivityIndicator, Button, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ModalInterface {
    loading: boolean
    modalVisible: boolean
    titleModal: string
    bodyModal: string,
    typeMessage: string
    onClose: () => void;
}

export const ModalComponent = ({ loading, modalVisible, titleModal, bodyModal, typeMessage, onClose }: ModalInterface) => {

    const titleColor = (typeMessage: string) => {
        switch (typeMessage) {
            case 'sussess':
                return 'green';
            case 'warning':
                return 'red';
            default:
                return 'grey';
        }
    };

    const renderIcon = (typeMessage: string) => {
        switch (typeMessage) {
            case 'sussess':
                return (
                    <Text style={{ color: titleColor(typeMessage), fontSize: 150, textAlign: 'center' }}>
                        ✔
                    </Text>
                )
            case 'warning':
                return (
                    <Text style={{ color: titleColor(typeMessage), fontSize: 150, textAlign: 'center' }}>
                        ⚠
                    </Text>
                )
            default:
                return (
                    <Text style={{ color: titleColor(typeMessage), fontSize: 150, textAlign: 'center' }}>
                        ⓘ
                    </Text>
                )
        }
    }


    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    {loading ? (
                        <>
                            <ActivityIndicator size="large" />
                            <Text style={styles.title}>
                                Consultando...
                            </Text>
                        </>
                    ) : (
                        <>
                            {renderIcon(typeMessage) || ""}

                            <Text style={{ ...styles.title, textAlign: 'center', fontSize: 25, color: titleColor(typeMessage) || 'black' }}>
                                {titleModal}
                            </Text>

                            <Text style={styles.label}>
                                Datos adicionales:
                            </Text>

                            <Text style={styles.value}>
                                {bodyModal}
                            </Text>
                            <Pressable
                                style={styles.closeButton}
                                onPress={onClose}
                            >
                                <Text style={styles.closeButtonText}>
                                    Cerrar
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>
            </View>
        </Modal>



    )
}


const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 15,
    },
    value: {
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },

    closeButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});