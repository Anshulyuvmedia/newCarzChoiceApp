import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import images from '@/constants/images';
import OTPModal from '@/components/OTPModal';
import UserTypeToggle from '@/components/UserTypeToggle';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [isUser, setIsUser] = useState(true);
  const [tempOTP, setTempOTP] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();

  const startResendCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOTP = async (showToast = true) => {
    if (!/^\d{10}$/.test(mobile)) {
      Toast.show({ type: 'error', text1: 'Invalid', text2: 'Enter 10-digit mobile number' });
      return false;
    }

    setLoading(true);
    try {
      const res = await fetch('https://carzchoice.com/api/send_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactno: mobile }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        if (__DEV__ && result.generated_otp) {
          setTempOTP(result.generated_otp);
        }
        if (showToast) {
          Toast.show({ type: 'success', text1: 'OTP Sent', text2: 'Check your SMS' });
        }
        setOtpModalVisible(true);
        startResendCooldown();
        return true;
      } else {
        // Handle mobile already registered
        if (res.status === 409) {
          Toast.show({ type: 'error', text1: 'Already Registered', text2: result.message });
        } else {
          Toast.show({ type: 'error', text1: 'Failed', text2: result.message || 'Could not send OTP' });
        }
        return false;
      }
    } catch (error) {
      console.error('sendOTP error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Network error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp) => {
    setLoading(true);
    try {
      const res = await fetch('https://carzchoice.com/api/verify_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactno: mobile, otp }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setOtpVerified(true);
        setOtpModalVisible(false);
        Toast.show({ type: 'success', text1: 'Verified!', text2: 'Mobile verified' });
      } else {
        Toast.show({ type: 'error', text1: 'Invalid OTP', text2: result.message || 'Try again' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    const payload = {
      usertype: isUser ? 'user' : 'dealer',
      fullname: username,
      contactno: mobile,
      email: email,
      password: password,
    };

    try {
      const res = await fetch('https://carzchoice.com/api/register_customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Registered!' });
        setTimeout(() => router.push('/signin'), 1500);
      } else {
        if (res.status === 409) {
          Toast.show({ type: 'error', text1: 'Email Taken', text2: result.message });
        } else if (res.status === 422) {
          const errors = Object.values(result.errors || {}).flat().join(', ');
          Toast.show({ type: 'error', text1: 'Invalid', text2: errors });
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: result.message || 'Registration failed' });
        }
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Network error' });
    }
  };

  const handleNext = async () => {
    if (!username || !mobile || !email || !password) {
      Toast.show({ type: 'error', text1: 'Missing', text2: 'Fill all fields' });
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      Toast.show({ type: 'error', text1: 'Invalid', text2: '10 digits required' });
      return;
    }

    if (!otpVerified) {
      await sendOTP();
    } else {
      await registerUser();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={images.applogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.heading}>Join Us and Explore New Opportunities</Text>
        <UserTypeToggle isUser={isUser} setIsUser={setIsUser} setOtpVerified={setOtpVerified} />

        <View style={styles.form}>
          <Text style={styles.subheading}>Register As {isUser ? 'User' : 'Dealer'}</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Enter Full Name" value={username} onChangeText={setUsername} />

          <View className="flex-row">
            <Text style={styles.label}>Mobile No.</Text>
            <Text className="text-danger text-sm ms-2 align-middle">(Must be unique)</Text>
          </View>

          <View style={styles.mobileRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="10-digit mobile"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              editable={!otpVerified}
            />
            {otpVerified && <Text style={styles.verified}>Verified</Text>}
          </View>

          <View className="flex-row">
            <Text style={styles.label}>Email</Text>
            <Text className="text-danger text-sm ms-2 align-middle">(Must be unique)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={handleNext}
            disabled={loading}
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          >
            <Text style={styles.submitText}>
              {loading ? 'Please wait...' : otpVerified ? 'Complete Registration' : 'Send OTP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signin')} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.highlight}>Login now!</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <OTPModal
          visible={otpModalVisible}
          onClose={() => setOtpModalVisible(false)}
          onVerify={verifyOTP}
          onResend={sendOTP}
          loading={loading}
          mobile={mobile}
          tempOTP={tempOTP}
        />
        <Toast position="bottom" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 20 },
  logo: { width: '100%', height: 100 },
  heading: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', paddingTop: 16 },
  form: { paddingHorizontal: 40, marginTop: 16 },
  subheading: { textAlign: 'center', color: '#666', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '700', marginVertical: 6 },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 6,
    fontFamily: 'Rubik-Regular',
  },
  mobileRow: { flexDirection: 'row', alignItems: 'center' },
  verified: { marginLeft: 8, color: 'green', fontWeight: 'bold' },
  resendLink: { textAlign: 'right', color: '#0061ff', fontSize: 13, marginBottom: 8 },
  disabledLink: { opacity: 0.5 },
  submitBtn: {
    backgroundColor: '#0061ff',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: { backgroundColor: '#aaa' },
  submitText: { color: 'white', fontSize: 16, fontWeight: '600' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { fontSize: 16, color: '#000' },
  highlight: { color: '#0061ff', fontWeight: '700' },
});

export default Signup;