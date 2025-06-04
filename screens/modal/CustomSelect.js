import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {colors, spacing, typography} from '../../theme/theme';

export default function CustomSelect({
  value,
  onSelect,
  options,
  placeholder = 'Select Category',
}) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.selectText}>{value ? value : placeholder}</Text>
        <Feather name="chevron-down" size={20} color={colors.grey} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(true)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.scrollArea}
              showsVerticalScrollIndicator={false} // 👈 hides the black scroll line
              contentContainerStyle={{paddingBottom: 10}} // optional smoother feel
            >
              {options.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    setModalVisible(false);
                  }}
                  style={styles.optionButton}>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selectBox: {
    backgroundColor: colors.darkGray1,
    borderRadius: 10,
    padding: 12,
    marginBottom: spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectText: {
    color: colors.grey,
    ...typography.paragraph2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 0,
    width: '80%',
    maxHeight: '50%',
    overflow: 'hidden', // 👈 helps with border radius on scroll
  },

  scrollArea: {
    maxHeight: '8 0%' // 👈 controls the height of scrollable area
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGray1,
  },
  optionText: {
    color: colors.white,
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.darkGray1,
  },
  cancelText: {
    color: colors.moderateRed,
    fontSize: 16,
  },
});
