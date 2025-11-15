import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const OTPModal = ({ visible, onClose, onVerify, loading, mobile, onResend, tempOTP }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [cooldown, setCooldown] = useState(0);
    const inputs = useRef([]);

    const startCooldown = () => {
        setCooldown(30);
        const timer = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResend = async () => {
        if (cooldown > 0 || loading) return;
        const success = await onResend(false);
        if (success) {
            setOtp(['', '', '', '', '', '']);
            inputs.current[0]?.focus();
            startCooldown();
        }
    };

    const handleChange = (text, index) => {
        if (!/^\d?$/.test(text)) return;
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) inputs.current[index + 1]?.focus();
        if (newOtp.every(d => d !== '')) onVerify(newOtp.join(''));
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        if (visible) {
            setOtp(['', '', '', '', '', '']);
            inputs.current[0]?.focus();
            setCooldown(0);
        }
    }, [visible]);

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Enter OTP</Text>
                    <Text style={styles.subtitle}>Sent to +91 {mobile}</Text>
                    {/* <Text style={styles.subtitle}>OPT: {tempOTP}</Text> */}

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={ref => (inputs.current[index] = ref)}
                                style={styles.otpBox}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={digit}
                                onChangeText={text => handleChange(text, index)}
                                onKeyPress={e => handleKeyPress(e, index)}
                                editable={!loading}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={() => onVerify(otp.join(''))}
                        disabled={otp.some(d => d === '') || loading}
                        style={[
                            styles.verifyBtn,
                            (otp.some(d => d === '') || loading) && styles.verifyBtnDisabled,
                        ]}
                    >
                        <Text style={styles.verifyBtnText}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={cooldown > 0 || loading}
                        style={styles.resendBtn}
                    >
                        <Text style={[styles.resendText, cooldown > 0 && styles.disabledText]}>
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '85%', backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
    otpBox: {
        width: 48, height: 52, borderColor: '#ccc', borderWidth: 1,
        borderRadius: 10, textAlign: 'center', fontSize: 18, fontWeight: '600',
        backgroundColor: '#f9f9f9',
    },
    verifyBtn: { backgroundColor: '#0061ff', paddingVertical: 14, borderRadius: 25, width: '100%', alignItems: 'center' },
    verifyBtnDisabled: { backgroundColor: '#aaa' },
    verifyBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
    resendBtn: { marginTop: 16 },
    resendText: { color: '#0061ff', fontSize: 15, textAlign: 'center' },
    disabledText: { color: '#aaa' },
    cancelBtn: { marginTop: 16 },
    cancelText: { color: '#666', fontSize: 15 },
});

export default OTPModal;