import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Modal, StyleSheet, Text, View, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getDataSheriff } from './src/api/requestApi';
import { ModalComponent } from './src/components/ModalComponent';

interface BarcodeScannedEvent {
	data: string
}

export default function App() {
	const [permission, requestPermission] = useCameraPermissions();

	const [modalVisible, setModalVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [apiResponse, setApiResponse] = useState('');
	const [typeResponse, setTypeResponse] = useState('');
	const [subTextModal, setSubTextModal] = useState('');

	useEffect(() => {
		if (!permission?.granted) {
			requestPermission();
		}
	}, [permission]);

	const handleBarcodeScanned = async ({ data }: BarcodeScannedEvent) => {
		Vibration.vibrate(100);

		setModalVisible(true);
		setLoading(true);

		try {
			const dataSplit = data.split("&")[0];
			const validateLengthString = dataSplit.length >= 61; // mayor o igual a 61
			const validateStringWeb = dataSplit.split("?")[0] === "https://portal.sidiv.registrocivil.cl/docstatus";

			if (validateLengthString && validateStringWeb) {
				const url = new URL(dataSplit);
				const params = Object.fromEntries(
					[...url.searchParams.entries()].map(([key, value]) => [
						key.toLowerCase(),
						value,
					])
				);
				const rutQuery = params?.run;
				setSubTextModal(`RUT: ${rutQuery}`)

				if (rutQuery) {
					const resultGetData = await getDataSheriff(rutQuery);
					setApiResponse(resultGetData?.textResp);
					setTypeResponse(resultGetData?.typeResp);

				} else {
					setApiResponse("QR escaneado no valido")
					setTypeResponse("normal");
				}

			} else {
				setApiResponse("QR escaneado no valido")
				setTypeResponse("normal");
			}

		} finally {
			setLoading(false);
		}
	};

	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={styles.center}>
				<Text>Sin permisos de cámara</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<CameraView
				style={StyleSheet.absoluteFill}
				facing="back"
				barcodeScannerSettings={{
					barcodeTypes: ['qr'],
				}}
				onBarcodeScanned={
					modalVisible ? undefined : handleBarcodeScanned
				}
			/>

			<ModalComponent
				loading={loading}
				modalVisible={modalVisible}
				titleModal={apiResponse}
				bodyModal={subTextModal}
				typeMessage={typeResponse}
				onClose={() => {
					setModalVisible(false);
					setApiResponse('');
					setTypeResponse('')
					setSubTextModal('')
				}} />

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
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
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 15,
	},
	label: {
		fontWeight: 'bold',
		marginTop: 10,
	},
	value: {
		marginBottom: 10,
	},
});