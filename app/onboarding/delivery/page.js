"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { driverAPI, getToken } from "@/libs/api"; // You'll need to create driverAPI
import Cookies from "js-cookie";
import {
  Car,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  MapPin,
  Phone,
  CreditCard,
  Clock,
  Truck,
} from "lucide-react";

export default function DriverOnboarding() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form data matching backend Driver model
  const [formData, setFormData] = useState({
    // Personal & Contact Info (some from registration)
    phone_number: "", // Required field from model

    // License & Vehicle Info
    license_number: "", // Required unique field
    vehicle_type: "", // Required enum: 'bike', 'scooter', 'car', 'truck'
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: new Date().getFullYear(),
    vehicle_color: "",
    license_plate: "", 
    insurance_number: "",

    documents: {
      driver_license_front: null,
      driver_license_back: null,
      vehicle_registration: null,
      insurance_certificate: null,
      profile_photo: null,
      vehicle_photo: null,
    },

    emergency_contact_name: "",
    emergency_contact_phone: "",
    bank_account_iban: "", 
    tax_id: "", 
  });

  const totalSteps = 4;

  const vehicleTypes = [
    {
      value: "bike",
      label: "Bicycle",
      icon: "🚲",
      description: "Eco-friendly, great for city centers",
      requirements: ["Valid ID", "Profile photo"],
    },
    {
      value: "scooter",
      label: "Scooter/Motorcycle",
      icon: "🛵",
      description: "Fast and efficient for medium distances",
      requirements: ["Driver license", "Vehicle registration", "Insurance"],
    },
    {
      value: "car",
      label: "Car",
      icon: "🚗",
      description: "Best for long distances and large orders",
      requirements: ["Driver license", "Vehicle registration", "Insurance"],
    },
    {
      value: "truck",
      label: "Truck/Van",
      icon: "🚛",
      description: "Perfect for bulk deliveries",
      requirements: [
        "Commercial license",
        "Vehicle registration",
        "Commercial insurance",
      ],
    },
  ];

  const vehicleMakes = [
    "Audi",
    "BMW",
    "Citroën",
    "Fiat",
    "Ford",
    "Honda",
    "Hyundai",
    "Kia",
    "Mercedes-Benz",
    "Nissan",
    "Opel",
    "Peugeot",
    "Renault",
    "Seat",
    "Skoda",
    "Toyota",
    "Volkswagen",
    "Volvo",
    "Other",
  ];

  const vehicleColors = [
    "White",
    "Black",
    "Silver",
    "Gray",
    "Blue",
    "Red",
    "Green",
    "Yellow",
    "Orange",
    "Brown",
    "Purple",
    "Gold",
    "Other",
  ];

  const getRequiredDocuments = (vehicleType) => {
    const baseDocuments = [
      { key: "profile_photo", label: "Profile Photo", required: true },
      {
        key: "driver_license_front",
        label: "Driver License (Front)",
        required: vehicleType !== "bike",
      },
      {
        key: "driver_license_back",
        label: "Driver License (Back)",
        required: vehicleType !== "bike",
      },
    ];

    if (vehicleType !== "bike") {
      baseDocuments.push(
        {
          key: "vehicle_registration",
          label: "Vehicle Registration",
          required: true,
        },
        {
          key: "insurance_certificate",
          label: "Insurance Certificate",
          required: true,
        },
        { key: "vehicle_photo", label: "Vehicle Photo", required: true }
      );
    }

    return baseDocuments;
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const userDataCookie = Cookies.get("userData");

      console.log("Driver Auth Check - Token:", token ? "Present" : "Missing");
      console.log(
        "Driver Auth Check - UserData:",
        userDataCookie ? "Present" : "Missing"
      );

      if (!token || !userDataCookie) {
        console.log("No auth token or user data found, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        const userData = JSON.parse(userDataCookie);
        console.log("Parsed user data:", userData);

        if (userData.userType !== "delivery_driver") {
          console.log("User is not a driver, redirecting to dashboard");
          router.push("/dashboard");
          return;
        }

        // Pre-fill phone if available from registration
        if (userData.phone && !formData.phone_number) {
          setFormData((prev) => ({ ...prev, phone_number: userData.phone }));
        }

        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentUpload = (documentKey, file) => {
    if (file) {
      // In a real app, you'd upload to cloud storage and get a URL
      // For now, we'll store the file object
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentKey]: file,
        },
      }));
    }
  };

  // Validation functions
  const validateStep1 = () => {
    const errors = [];

    if (!formData.phone_number) {
      errors.push("Phone number is required");
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone_number)) {
      errors.push("Please provide a valid phone number");
    }

    if (!formData.emergency_contact_name) {
      errors.push("Emergency contact name is required");
    }

    if (!formData.emergency_contact_phone) {
      errors.push("Emergency contact phone is required");
    } else if (
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.emergency_contact_phone)
    ) {
      errors.push("Please provide a valid emergency contact phone");
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors = [];

    if (!formData.license_number) {
      errors.push("Driver license number is required");
    }

    if (!formData.vehicle_type) {
      errors.push("Vehicle type is required");
    }

    if (!formData.license_plate) {
      errors.push("License plate is required");
    }

    if (formData.vehicle_type !== "bike") {
      if (!formData.vehicle_make) {
        errors.push("Vehicle make is required");
      }
      if (!formData.vehicle_model) {
        errors.push("Vehicle model is required");
      }
      if (
        !formData.vehicle_year ||
        formData.vehicle_year < 1990 ||
        formData.vehicle_year > new Date().getFullYear() + 1
      ) {
        errors.push("Please provide a valid vehicle year");
      }
      if (!formData.insurance_number) {
        errors.push("Insurance number is required for motorized vehicles");
      }
    }

    return errors;
  };

  const validateStep3 = () => {
    const errors = [];
    const requiredDocs = getRequiredDocuments(formData.vehicle_type);

    requiredDocs.forEach((doc) => {
      if (doc.required && !formData.documents[doc.key]) {
        errors.push(`${doc.label} is required`);
      }
    });

    return errors;
  };

  const validateStep4 = () => {
    const errors = [];

    if (
      formData.bank_account_iban &&
      !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(
        formData.bank_account_iban.replace(/\s/g, "")
      )
    ) {
      errors.push("Please provide a valid IBAN");
    }

    return errors;
  };

  const nextStep = () => {
    let errors = [];

    switch (currentStep) {
      case 1:
        errors = validateStep1();
        break;
      case 2:
        errors = validateStep2();
        break;
      case 3:
        errors = validateStep3();
        break;
      case 4:
        errors = validateStep4();
        break;
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    setError("");
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Final validation
      const allErrors = [
        ...validateStep1(),
        ...validateStep2(),
        ...validateStep3(),
        ...validateStep4(),
      ];

      if (allErrors.length > 0) {
        setError(allErrors.join(". "));
        return;
      }

      // Check authentication
      const token = getToken();
      const userDataCookie = Cookies.get("userData");

      if (!token || !userDataCookie) {
        setError("Authentication expired. Please log in again.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      // Prepare driver data for backend
      const driverData = {
        phone_number: formData.phone_number.trim(),
        license_number: formData.license_number.trim(),
        vehicle_type: formData.vehicle_type,
        vehicle_make: formData.vehicle_make?.trim() || null,
        vehicle_model: formData.vehicle_model?.trim() || null,
        vehicle_year: formData.vehicle_year || null,
        vehicle_color: formData.vehicle_color || null,
        license_plate: formData.license_plate.trim(),
        insurance_number: formData.insurance_number?.trim() || null,
        // documents: {
        //   ...formData.documents,
        //   emergency_contact_name: formData.emergency_contact_name,
        //   emergency_contact_phone: formData.emergency_contact_phone,
        //   bank_account_iban:
        //     formData.bank_account_iban?.replace(/\s/g, "") || null,
        //   tax_id: formData.tax_id || null,
        // },
      };

      console.log("Submitting driver data:", driverData);

      // This would be your actual API call
      const response = await driverAPI.createDriverProfile(driverData);

      console.log("Driver profile created:", response); 
      if (!response || !response.success) {
        throw new Error(
          response?.message || "Failed to create driver profile"
        );
      }

      setSuccessMessage(
        "Driver profile submitted successfully! We'll review your application and get back to you within 24-48 hours."
      );

      // Redirect to driver dashboard/waiting page
      setTimeout(() => {
        router.push("/driver/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Driver onboarding error:", error);
      setError(
        error.message ||
          "Failed to submit driver application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome {user?.firstName}! Become a Delivery Driver
          </h1>
          <p className="text-gray-600">
            Complete your driver profile to start earning money with deliveries
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex justify-between mb-8">
          {[
            { icon: Phone, label: "Contact Info" },
            { icon: Car, label: "Vehicle Details" },
            { icon: FileText, label: "Documents" },
            { icon: CreditCard, label: "Payment Info" },
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index + 1 <= currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-2 text-center font-medium">
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-green-800 font-medium">{successMessage}</div>
            <div className="text-green-700 text-sm mt-1">
              Redirecting to dashboard...
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <div className="text-red-800 font-medium">{error}</div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8">
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Phone className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Contact Information
                  </h2>
                  <p className="text-gray-600">
                    We need your contact details for verification and
                    communication
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleInputChange("phone_number", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="+33123456789"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This will be used for delivery coordination
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) =>
                        handleInputChange(
                          "emergency_contact_name",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Phone{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergency_contact_phone",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="+33123456789"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">
                        Data Privacy
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Your personal information is encrypted and only used for
                        verification and safety purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Car className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Vehicle Information
                  </h2>
                  <p className="text-gray-600">
                    Tell us about your delivery vehicle
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicleTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() =>
                          handleInputChange("vehicle_type", type.value)
                        }
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.vehicle_type === type.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{type.icon}</div>
                          <h3 className="font-medium text-gray-900">
                            {type.label}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {type.description}
                          </p>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              Requirements:
                            </p>
                            <p className="text-xs text-gray-500">
                              {type.requirements.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver License Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) =>
                        handleInputChange("license_number", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="123456789"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Plate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.license_plate}
                      onChange={(e) =>
                        handleInputChange(
                          "license_plate",
                          e.target.value.toUpperCase()
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="AB-123-CD"
                      required
                    />
                  </div>
                </div>

                {formData.vehicle_type && formData.vehicle_type !== "bike" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Make <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.vehicle_make}
                          onChange={(e) =>
                            handleInputChange("vehicle_make", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          required
                        >
                          <option value="">Select make</option>
                          {vehicleMakes.map((make) => (
                            <option key={make} value={make}>
                              {make}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Model <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.vehicle_model}
                          onChange={(e) =>
                            handleInputChange("vehicle_model", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Civic"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1990"
                          max={new Date().getFullYear() + 1}
                          value={formData.vehicle_year}
                          onChange={(e) =>
                            handleInputChange(
                              "vehicle_year",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Color
                        </label>
                        <select
                          value={formData.vehicle_color}
                          onChange={(e) =>
                            handleInputChange("vehicle_color", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select color</option>
                          {vehicleColors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Insurance Number{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.insurance_number}
                          onChange={(e) =>
                            handleInputChange(
                              "insurance_number",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Insurance policy number"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Required Documents
                  </h2>
                  <p className="text-gray-600">
                    Upload the required documents for verification
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getRequiredDocuments(formData.vehicle_type).map((doc) => (
                    <div
                      key={doc.key}
                      className="border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {doc.label}
                        </h3>
                        {doc.required && (
                          <span className="text-red-500 text-sm">Required</span>
                        )}
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            handleDocumentUpload(doc.key, e.target.files[0])
                          }
                          className="hidden"
                          id={`upload-${doc.key}`}
                        />
                        <label
                          htmlFor={`upload-${doc.key}`}
                          className="cursor-pointer"
                        >
                          {formData.documents[doc.key] ? (
                            <div className="text-green-600">
                              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">
                                {formData.documents[doc.key].name ||
                                  "File uploaded"}
                              </p>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              <Upload className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">Click to upload</p>
                              <p className="text-xs">
                                JPG, PNG, or PDF (max 10MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">
                        Document Guidelines
                      </h3>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Ensure all documents are clear and readable</li>
                        <li>• Photos should be well-lit with no shadows</li>
                        <li>• Documents must be valid and not expired</li>
                        <li>• File size should not exceed 10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment & Final Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Information
                  </h2>
                  <p className="text-gray-600">
                    Setup your payment details to receive earnings
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account (IBAN)
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_iban}
                    onChange={(e) =>
                      handleInputChange(
                        "bank_account_iban",
                        e.target.value.toUpperCase()
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="FR14 2004 1010 0505 0001 3M02 606"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Your delivery earnings will be deposited to this account
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID / Social Security Number
                  </label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) =>
                      handleInputChange("tax_id", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Tax identification number"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Required for tax reporting purposes
                  </p>
                </div>

                {/* Application Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Application Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Vehicle Type:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {vehicleTypes.find(
                          (v) => v.value === formData.vehicle_type
                        )?.label || "Not selected"}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2 text-gray-600">
                        {formData.phone_number || "Not provided"}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        License #:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {formData.license_number || "Not provided"}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        License Plate:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {formData.license_plate || "Not provided"}
                      </span>
                    </div>

                    {formData.vehicle_type !== "bike" && (
                      <>
                        <div>
                          <span className="font-medium text-gray-700">
                            Vehicle:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {formData.vehicle_year} {formData.vehicle_make}{" "}
                            {formData.vehicle_model}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            Insurance:
                          </span>
                          <span className="ml-2 text-gray-600">
                            {formData.insurance_number || "Not provided"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Documents Uploaded:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getRequiredDocuments(formData.vehicle_type).map(
                        (doc) => (
                          <span
                            key={doc.key}
                            className={`px-2 py-1 rounded text-xs ${
                              formData.documents[doc.key]
                                ? "bg-green-100 text-green-800"
                                : doc.required
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {doc.label}{" "}
                            {formData.documents[doc.key]
                              ? "✓"
                              : doc.required
                              ? "✗"
                              : "-"}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* What happens next */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-3">
                    What happens next?
                  </h3>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <strong>Application Review (24-48 hours)</strong>
                        <p>
                          Our team will verify your documents and information
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Shield className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <strong>Background Check (2-3 business days)</strong>
                        <p>
                          We'll conduct a background check for safety and
                          security
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <strong>Account Activation</strong>
                        <p>
                          Once approved, you'll receive login credentials and
                          can start delivering
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <div className="text-sm text-gray-700">
                      <p>
                        I agree to the{" "}
                        <a
                          href="/terms"
                          className="text-blue-600 hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          className="text-blue-600 hover:underline"
                        >
                          Privacy Policy
                        </a>
                        . I understand that:
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600">
                        <li>
                          • I will be working as an independent contractor
                        </li>
                        <li>
                          • I am responsible for my own insurance and taxes
                        </li>
                        <li>
                          • I must maintain a valid driver's license and
                          insurance
                        </li>
                        <li>
                          • I will follow all traffic laws and safety guidelines
                        </li>
                      </ul>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}

              <div className="flex-1" />

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Submitting Application...</span>
                    </div>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help? Contact our support team at{" "}
            <a
              href="mailto:drivers@company.com"
              className="text-blue-600 hover:underline"
            >
              drivers@company.com
            </a>
          </p>
          <p className="mt-1">
            Or call us at{" "}
            <a
              href="tel:+33123456789"
              className="text-blue-600 hover:underline"
            >
              +33 1 23 45 67 89
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
