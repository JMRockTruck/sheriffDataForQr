import React, { useEffect, useRef, useState } from 'react';
import {
	Animated,
	StyleSheet,
	Text,
	View,
	Vibration,
	Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { getDataBlackListSamanta, getDataSheriff } from './src/api/requestApi';
import { ModalComponent } from './src/components/ModalComponent';

interface BarcodeScannedEvent {
	data: string;
}

// ─── Esquinas animadas del viewfinder ────────────────────────────────────────
function ScanCorners({ active }: { active: boolean }) {
	const anim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (!active) return;
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
				Animated.timing(anim, { toValue: 0, duration: 1800, useNativeDriver: true }),
			])
		);
		loop.start();
		return () => loop.stop();
	}, [active]);

	const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 230] });

	return (
		<>
			{/* Línea de escaneo */}
			{active && (
				<Animated.View
					style={[styles.scanLine, { transform: [{ translateY }] }]}
				/>
			)}
			{/* Esquinas */}
			<View style={[styles.corner, styles.cTL]} />
			<View style={[styles.corner, styles.cTR]} />
			<View style={[styles.corner, styles.cBL]} />
			<View style={[styles.corner, styles.cBR]} />
		</>
	);
}

// ─── Chip de estado ───────────────────────────────────────────────────────────
function StatusChip() {
	const pulse = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, { toValue: 0.3, duration: 900, useNativeDriver: true }),
				Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
			])
		).start();
	}, []);

	return (
		<View style={styles.statusChip}>
			<Animated.View style={[styles.statusDot, { opacity: pulse }]} />
			<Text style={styles.statusChipText}>CÁMARA ACTIVA</Text>
		</View>
	);
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
	const [permission, requestPermission] = useCameraPermissions();
	const [modalVisible, setModalVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [apiResponse, setApiResponse] = useState('');
	const [typeResponse, setTypeResponse] = useState('');
	const [subTextModal, setSubTextModal] = useState('');

	const fadeIn = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (!permission?.granted) requestPermission();
		Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
	}, [permission]);

	const handleBarcodeScanned = async ({ data }: BarcodeScannedEvent) => {
		Vibration.vibrate(100);
		setModalVisible(true);
		setLoading(true);
		setApiResponse("");
		setTypeResponse("");
		setSubTextModal("");

		try {
			const dataSplit = data.split('&')[0];
			const validateLengthString = dataSplit.length >= 61;
			const validateStringWeb =
				dataSplit.split('?')[0] ===
				'https://portal.sidiv.registrocivil.cl/docstatus';

			if (validateLengthString && validateStringWeb) {

				let url: URL;
				try {
					url = new URL(dataSplit);
				} catch {
					setApiResponse('QR con formato inválido');
					setTypeResponse('normal');
					return;
				}

				const params = Object.fromEntries(
					[...url.searchParams.entries()].map(([key, value]) => [
						key.toLowerCase(),
						value,
					])
				);
				const rutQuery = params?.run;
				setSubTextModal(`RUT: ${rutQuery}`);

				if (rutQuery) {

					// Validamos lista negra de samanta
					const resultDataBlackList = await getDataBlackListSamanta(rutQuery);

					if (resultDataBlackList?.isBlackList === false) {
						// Validamos mongo con datos de sheriff
						const resultGetData = await getDataSheriff(rutQuery);
						setApiResponse(resultGetData?.textResp);
						setTypeResponse(resultGetData?.typeResp);
						setSubTextModal(resultDataBlackList?.detailMotive)

					} else {
						setApiResponse(resultDataBlackList?.textResp);
						setTypeResponse(resultDataBlackList?.typeResp);
						setSubTextModal(resultDataBlackList?.detailMotive);
					}

				} else {
					setApiResponse('QR escaneado no válido');
					setTypeResponse('normal');
				}
			} else {
				setApiResponse('QR escaneado no válido');
				setTypeResponse('normal');
			}
		} catch (error) {
			setApiResponse('Error al solicitar datos');
			setTypeResponse('danger');
			setSubTextModal("Error en solicitar datos al servido");
		} finally {
			setLoading(false);
		}
	};

	if (!permission) return <View style={styles.container} />;

	if (!permission.granted) {
		return (
			<View style={[styles.container, styles.center]}>
				<Text style={styles.noPermIcon}>🔒</Text>
				<Text style={styles.noPermTitle}>Sin acceso a la cámara</Text>
				<Text style={styles.noPermText}>
					Esta aplicación necesita la cámara para escanear cédulas de identidad.
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Cámara */}
			<CameraView
				style={StyleSheet.absoluteFill}
				facing="back"
				barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
				onBarcodeScanned={modalVisible ? undefined : handleBarcodeScanned}
			/>

			{/* Velo superior */}
			<View style={styles.veloTop} />
			{/* Velo inferior */}
			<View style={styles.veloBottom} />
			{/* Velos laterales */}
			<View style={styles.veloLeft} />
			<View style={styles.veloRight} />

			{/* Contenido sobre la cámara */}
			<Animated.View style={[styles.overlay, { opacity: fadeIn }]}>

				{/* Header */}
				<View style={styles.header}>
					<View style={styles.badgeRow}>
						<View style={styles.badge}>
							<Text style={styles.badgeText}>CONSULTA DE ANTECEDENTES</Text>
						</View>
					</View>
					{/* <Text style={styles.appTitle}>Sheriff</Text> */}
					<Text style={styles.appTitle}>Consultar antecedentes</Text>

					<Text style={styles.appSubtitle}>
						Escanea el QR de la cédula para consultar antecedentes
					</Text>
				</View>

				{/* Viewfinder */}
				<View style={styles.viewfinderWrapper}>
					<View style={styles.viewfinder}>
						<ScanCorners active={!modalVisible} />
					</View>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<StatusChip />
					<Text style={styles.footerHint}>
						Apunta la cámara al QR de la cédula
					</Text>
					<Text style={{ ...styles.appSubtitle, color: '#F47174' }}>
						IMPORTANTE: La informacion de Sheriff se actualiza en el sistema cada dia a las 1:30 AM
					</Text>
					<View style={styles.divider} />
				</View>

			</Animated.View>

			<ModalComponent
				loading={loading}
				modalVisible={modalVisible}
				titleModal={apiResponse}
				bodyModal={subTextModal}
				typeMessage={typeResponse}
				onClose={() => {
					setModalVisible(false);
					setApiResponse('');
					setTypeResponse('');
					setSubTextModal('');
				}}
			/>
		</View>
	);
}

// ─── Tokens de diseño ─────────────────────────────────────────────────────────
const C = {
	bg: '#060d1a',
	velo: 'rgba(6, 13, 26, 0.78)',
	accent: '#00d4ff',
	accentDim: 'rgba(0, 212, 255, 0.18)',
	white: '#ffffff',
	muted: 'rgba(255,255,255,0.45)',
	faint: 'rgba(255,255,255,0.15)',
	border: 'rgba(0, 212, 255, 0.35)',
};

const VF = 260; // tamaño del viewfinder
const CR = 32;  // tamaño esquina
const CT = 3;   // grosor esquina

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: C.bg },
	center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },

	// Velos que oscurecen los bordes dejando la zona central clara
	veloTop: {
		position: 'absolute', top: 0, left: 0, right: 0,
		height: '30%', backgroundColor: C.velo,
	},
	veloBottom: {
		position: 'absolute', bottom: 0, left: 0, right: 0,
		height: '30%', backgroundColor: C.velo,
	},
	veloLeft: {
		position: 'absolute', top: '30%', left: 0,
		width: '10%', bottom: '30%', backgroundColor: C.velo,
	},
	veloRight: {
		position: 'absolute', top: '30%', right: 0,
		width: '10%', bottom: '30%', backgroundColor: C.velo,
	},

	// Overlay principal
	overlay: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: Platform.OS === 'ios' ? 64 : 44,
		paddingBottom: 44,
	},

	// Header
	header: { alignItems: 'center', gap: 8 },
	badgeRow: { marginBottom: 4 },
	badge: {
		backgroundColor: C.accentDim,
		borderWidth: 1,
		borderColor: C.border,
		borderRadius: 100,
		paddingHorizontal: 14,
		paddingVertical: 4,
	},
	badgeText: {
		color: C.accent,
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 2,
	},
	appTitle: {
		color: C.white,
		fontSize: 25,
		fontWeight: '800',
		letterSpacing: 0.5,
	},
	appSubtitle: {
		color: C.muted,
		fontSize: 13,
		textAlign: 'center',
		paddingHorizontal: 40,
		lineHeight: 19,
	},

	// Viewfinder
	viewfinderWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	viewfinder: {
		width: VF,
		height: VF,
		overflow: 'hidden',
	},

	// Esquinas
	corner: {
		position: 'absolute',
		width: CR,
		height: CR,
		borderColor: C.accent,
	},
	cTL: { top: 0, left: 0, borderTopWidth: CT, borderLeftWidth: CT, borderTopLeftRadius: 6 },
	cTR: { top: 0, right: 0, borderTopWidth: CT, borderRightWidth: CT, borderTopRightRadius: 6 },
	cBL: { bottom: 0, left: 0, borderBottomWidth: CT, borderLeftWidth: CT, borderBottomLeftRadius: 6 },
	cBR: { bottom: 0, right: 0, borderBottomWidth: CT, borderRightWidth: CT, borderBottomRightRadius: 6 },

	// Línea de escaneo
	scanLine: {
		position: 'absolute',
		top: 12,
		left: 12,
		right: 12,
		height: 1.5,
		backgroundColor: C.accent,
		opacity: 0.9,
		shadowColor: C.accent,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 1,
		shadowRadius: 8,
		elevation: 6,
	},

	// Footer
	footer: { alignItems: 'center', gap: 10 },
	statusChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 7,
		backgroundColor: C.accentDim,
		borderWidth: 1,
		borderColor: C.border,
		borderRadius: 100,
		paddingHorizontal: 14,
		paddingVertical: 6,
	},
	statusDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: C.accent,
	},
	statusChipText: {
		color: C.accent,
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 1.5,
	},
	footerHint: {
		color: C.muted,
		fontSize: 13,
	},
	divider: {
		width: 40,
		height: 1,
		backgroundColor: C.faint,
		marginVertical: 2,
	},
	footerLegal: {
		color: C.faint,
		fontSize: 10,
		letterSpacing: 0.3,
		textAlign: 'center',
		paddingHorizontal: 40,
	},

	// Sin permisos
	noPermIcon: { fontSize: 48, marginBottom: 12 },
	noPermTitle: { color: C.white, fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
	noPermText: { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});