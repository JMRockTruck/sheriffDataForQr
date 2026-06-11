import React, { useState } from 'react'
import { ActivityIndicator, Button, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
            case 'success':
                return 'green';
            case 'danger':
                return 'red';
            case 'warning':
                return '#BA8E23'
            default:
                return 'grey';
        }
    };

    const renderIcon = (typeMessage: string) => {
        switch (typeMessage) {
            case 'success':
                return (
                    <Text style={{ color: titleColor(typeMessage), fontSize: 150, textAlign: 'center' }}>
                        ✔
                    </Text>
                )
            case 'danger':
                return (
                    <Text style={{ color: titleColor(typeMessage), fontSize: 150, textAlign: 'center' }}>
                        ⚠
                    </Text>
                )
            case 'warning':
                return (
                    <Text style={{ color: titleColor(typeMessage), fontSize: 150, textAlign: 'center' }}>
                        👁
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
            animationType="fade"
            onRequestClose={onClose}

        >
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

                            {bodyModal && (
                                <>
                                    <Text style={styles.label}>
                                        Datos adicionales:
                                    </Text>
                                    <ScrollView style={styles.scrollContainer}>
                                    <Text style={styles.value}>
                                        {bodyModal}
                                    </Text>
                                    </ScrollView>
                                </>
                            )}

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
        fontSize: 12,
        marginTop: 15,
    },
    value: {
        marginBottom: 10,
        fontSize: 15,
        fontWeight: 'bold'
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
    scrollContainer: {
    maxHeight: 200,
    marginBottom: 10,
},
});