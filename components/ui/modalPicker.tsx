import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
    Animated,
    Easing,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ModalPickerProps {
  label: string;
  selectedValue: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ModalPicker({
  label,
  selectedValue,
  options,
  onValueChange,
  placeholder = "Select...",
  disabled = false,
}: ModalPickerProps) {
  const [visible, setVisible] = useState(false);
  const [tempValue, setTempValue] = useState(selectedValue);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));

  const open = () => {
    if (disabled) return;
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  const confirm = () => {
    onValueChange(tempValue);
    close();
  };

  return (
    <>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        onPress={open}
        disabled={disabled}
        style={[styles.field, disabled && styles.fieldDisabled]}
      >
        <Text
          style={[
            styles.fieldText,
            !selectedValue && { color: "#9CA3AF" },
          ]}
        >
          {selectedValue || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="none">
        <Animated.View
          style={[styles.overlay, { opacity: fadeAnim }]}
        >
          <TouchableOpacity style={styles.overlayTouchable} onPress={close} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={close}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirm}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>

          <Picker
            selectedValue={tempValue}
            onValueChange={setTempValue}
            itemStyle={styles.pickerItem}
          >
            {options.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  field: {
    backgroundColor: "#111827",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  fieldText: {
    color: "#FFF",
    fontSize: 16,
  },
  fieldDisabled: {
    opacity: 0.4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: "#374151",
    borderBottomWidth: 1,
  },
  cancel: { color: "#9CA3AF", fontSize: 16 },
  done: { color: "#10B981", fontSize: 16, fontWeight: "600" },
  pickerItem: {
    color: "#FFF",
    fontSize: 18,
    height: 180,
  },
});
