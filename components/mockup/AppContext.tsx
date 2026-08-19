import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  computeDriverTripCosts,
  driverEstimateDistanceKm,
  driverId,
  findUser,
  MCarOwned,
  MConfirmation,
  MDriverCar,
  MDriverFolder,
  MDriverTrip,
  MGroup,
  MNotification,
  MPinnedTemplate,
  MRide,
  MRequestStatus,
  MRideRequest,
  MUpcomingTrip,
  MUser,
  RIDER_GAS_VARIATION_PCT,
} from "./data";
import { supabase } from "../../SupabaseConfig";
import { UserService } from "../../store/userService";
import { GroupService } from "../../store/groupService";
import { SharedRideService } from "../../store/sharedRideService";
import { ConnectionService } from "../../store/connectionService";
import { CarService } from "../../store/carService";

type DriverTripForm = {
  origin: string;
  destination: string;
  carId: string;
  recipientQuery: string;
  recipientIds: string[];
  folderId: string;
  newFolderName: string;
};

type DriverTripPreview = {
  origin: string;
  destination: string;
  car: MDriverCar | undefined;
  distanceKm: number;
  totalCost: number;
  perRider: number;
  driverSavings: number;
  folderId: string;
  newFolderName: string;
  recipientIds: string[];
};

export type AppContextValue = {
  // current user + collections
  currentUser: MUser;
  users: MUser[];
  groups: MGroup[];
  rides: MRide[];
  rideRequests: MRideRequest[];
  confirmedRides: MConfirmation[];
  upcomingTrips: MUpcomingTrip[];

  // derived
  connections: MUser[];
  ridesByGroup: Record<string, MRide[]>;
  ungroupedRides: MRide[];
  requestBuckets: {
    pending: MRideRequest[];
    approved: MRideRequest[];
    declined: MRideRequest[];
  };

  // selections
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  selectedConfirmationId: string | null;
  setSelectedConfirmationId: (id: string | null) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  cancelTarget: MUpcomingTrip | null;
  setCancelTarget: (t: MUpcomingTrip | null) => void;

  // notifications
  notifications: MNotification[];
  notificationsOpen: boolean;
  unreadNotificationsCount: number;
  pushNotification: (title: string, body: string) => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;

  // create group flow
  createGroupOpen: boolean;
  setCreateGroupOpen: (v: boolean) => void;
  groupDraftName: string;
  setGroupDraftName: (v: string) => void;
  groupDraftDesc: string;
  setGroupDraftDesc: (v: string) => void;
  groupDraftEmail: string;
  setGroupDraftEmail: (v: string) => void;
  groupDraftSelected: Record<string, boolean>;
  toggleGroupDraftMember: (id: string) => void;
  addGroupMemberByEmail: () => void;
  confirmCreateGroup: () => void;
  resetCreateGroupDraft: () => void;

  // group detail
  newMemberEmail: string;
  setNewMemberEmail: (v: string) => void;
  addMemberToSelectedGroup: () => void;
  removeMemberFromSelectedGroup: (id: string) => void;
  deleteGroup: (id: string) => void;
  joinGroup: (id: string) => void;

  // ride detail (browse)
  selectedRideDetail: MRide | null;
  openRideDetail: (r: MRide) => void;
  closeRideDetail: () => void;

  // posted ride detail / edit
  selectedPostedRide: MRide | null;
  openPostedRideDetail: (r: MRide) => void;
  closePostedRideDetail: () => void;
  updatePostedRide: (id: string, fields: Partial<Pick<MRide, "origin" | "destination" | "departureTime" | "date" | "vehicle">>) => void;
  markRideComplete: (id: string) => void;

  // join request
  selectedRideToJoin: MRide | null;
  pickupPoint: string;
  setPickupPoint: (v: string) => void;
  dropoffPoint: string;
  setDropoffPoint: (v: string) => void;
  openJoinRequest: (r: MRide) => void;
  closeJoinRequest: () => void;
  submitJoinRequest: () => void;

  // driver approval (acting as driver)
  approveRideRequest: (id: string) => void;
  declineRideRequest: (id: string) => void;
  reassignDriver: (rideId: string, newDriverId: string) => void;

  // confirmed ride actions
  cancelConfirmedRide: (id: string) => void;
  sendQuickMessage: (id: string, msg: string) => void;
  markRideCompletion: (id: string, happened: boolean) => void;
  submitDriverReview: (id: string) => void;
  reviewRating: number;
  setReviewRating: (n: number) => void;
  reviewComment: string;
  setReviewComment: (v: string) => void;

  // upcoming trip cancel
  openCancelConfirm: (t: MUpcomingTrip) => void;
  confirmCancelUpcomingTrip: () => void;
  openRequestDetailsFromRequest: (r: MRideRequest) => void;
  openRideDetailsFromUpcoming: (t: MUpcomingTrip) => void;

  // post ride flow
  selectedCarForRide: MCarOwned | null;
  newRideForm: { origin: string; destination: string; time: string; date: string };
  setNewRideForm: (f: { origin: string; destination: string; time: string; date: string }) => void;
  ridePostGroupSelected: Record<string, boolean>;
  toggleRidePostGroup: (id: string) => void;
  ridePostPublic: boolean;
  setRidePostPublic: (v: boolean) => void;
  carPickerOpen: boolean;
  openCarPicker: () => void;
  closeCarPicker: () => void;
  selectCarForPosting: (c: MCarOwned) => void;
  closeRideCreation: () => void;
  postRideOffer: () => void;
  pinnedPostRides: MPinnedTemplate[];
  togglePinPastTrip: (route: string, date: string, id: string) => void;
  isRoutePinned: (route: string) => boolean;

  // profile views
  profileView: "overview" | "connections" | "connection_profile";
  setProfileView: (v: "overview" | "connections" | "connection_profile") => void;
  selectedProfileUserId: string | null;
  setSelectedProfileUserId: (v: string | null) => void;
  newFriendEmail: string;
  setNewFriendEmail: (v: string) => void;
  addFriendFromProfile: () => void;

  // driver cars
  driverCars: MDriverCar[];
  driverAddCarOpen: boolean;
  openDriverAddCar: () => void;
  setDriverAddCarOpen: (v: boolean) => void;
  driverFuelOpen: boolean;
  setDriverFuelOpen: (v: boolean) => void;
  driverCarDraft: { make: string; model: string; year: string };
  driverCarLoading: boolean;
  driverModelsLoading: boolean;
  driverYearsLoading: boolean;
  driverMakeOptions: string[];
  driverModelOptions: string[];
  driverYearOptions: string[];
  selectDriverCarMake: (make: string) => void;
  selectDriverCarModel: (model: string) => void;
  selectDriverCarYear: (year: string) => void;
  driverCarConsumption: string;
  setDriverCarConsumption: (v: string) => void;
  confirmDriverCarBasic: () => void;
  confirmDriverCarFuel: () => void;

  // driver friends
  driverFriendIds: string[];
  driverFriends: MUser[];
  driverContacts: MUser[];
  driverSyncOpen: boolean;
  setDriverSyncOpen: (v: boolean) => void;
  driverSyncSelected: Record<string, boolean>;
  toggleDriverSyncUser: (id: string) => void;
  confirmDriverSyncContacts: () => void;

  driverFriendFolders: MDriverFolder[];
  driverFolderOpen: boolean;
  openDriverCreateFolder: () => void;
  setDriverFolderOpen: (v: boolean) => void;
  driverFolderName: string;
  setDriverFolderName: (v: string) => void;
  driverFolderSelected: Record<string, boolean>;
  toggleDriverFolderMember: (id: string) => void;
  confirmDriverCreateFolder: () => void;

  // driver trip wizard
  driverTrips: MDriverTrip[];
  driverCreateTripOpen: boolean;
  setDriverCreateTripOpen: (v: boolean) => void;
  driverTripStep: 1 | 2 | 3;
  setDriverTripStep: (n: 1 | 2 | 3) => void;
  driverTripForm: DriverTripForm;
  setDriverTripForm: (f: (prev: DriverTripForm) => DriverTripForm) => void;
  openDriverTripWizard: () => void;
  driverTripBack: () => void;
  driverTripNext: () => void;
  addDriverRecipient: (id: string) => void;
  removeDriverRecipient: (id: string) => void;
  applyDriverFolderMembers: (folderId: string) => void;

  driverTripPreviewOpen: boolean;
  setDriverTripPreviewOpen: (v: boolean) => void;
  driverTripPreview: DriverTripPreview | null;
  confirmDriverTripSend: () => void;

  driverTripDetailsId: string | null;
  setDriverTripDetailsId: (id: string | null) => void;
  toggleDriverPaid: (tripId: string, riderId: string) => void;

  driverRateOpen: boolean;
  setDriverRateOpen: (v: boolean) => void;
  driverRateTarget: { tripId: string | null; riderId: string | null };
  openDriverRate: (tripId: string, riderId: string) => void;
  driverRateValue: number;
  setDriverRateValue: (n: number) => void;
  driverRateComment: string;
  setDriverRateComment: (v: string) => void;
  confirmDriverRate: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

const EMPTY_USER: MUser = {
  id: "",
  name: "",
  email: "",
  avatar: "",
  driverRating: 0,
  driverReviewCount: 0,
  driverRidesCompleted: 0,
  riderRating: 0,
  riderReviewCount: 0,
  riderRidesCompleted: 0,
  driverReviews: [],
  riderReviews: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MUser>(EMPTY_USER);
  const [users, setUsers] = useState<MUser[]>([]);
  const [groups, setGroups] = useState<MGroup[]>([]);
  const [rides, setRides] = useState<MRide[]>([]);
  const [rideRequests, setRideRequests] = useState<MRideRequest[]>([]);
  const [confirmedRides, setConfirmedRides] = useState<MConfirmation[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<MUpcomingTrip[]>([]);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const [selectedRideDetail, setSelectedRideDetail] = useState<MRide | null>(null);
  const [selectedPostedRide, setSelectedPostedRide] = useState<MRide | null>(null);
  const [selectedRideToJoin, setSelectedRideToJoin] = useState<MRide | null>(null);
  const [pickupPoint, setPickupPoint] = useState("");
  const [dropoffPoint, setDropoffPoint] = useState("");

  const [selectedConfirmationId, setSelectedConfirmationId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<MUpcomingTrip | null>(null);

  const [notifications, setNotifications] = useState<MNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupDraftName, setGroupDraftName] = useState("");
  const [groupDraftDesc, setGroupDraftDesc] = useState("");
  const [groupDraftEmail, setGroupDraftEmail] = useState("");
  const [groupDraftSelected, setGroupDraftSelected] = useState<Record<string, boolean>>({});

  const [profileView, setProfileView] = useState<"overview" | "connections" | "connection_profile">("overview");
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [newFriendEmail, setNewFriendEmail] = useState("");

  const [selectedCarForRide, setSelectedCarForRide] = useState<MCarOwned | null>(null);
  const [newRideForm, setNewRideForm] = useState({ origin: "", destination: "", time: "", date: "" });
  const [ridePostGroupSelected, setRidePostGroupSelected] = useState<Record<string, boolean>>({});
  const [ridePostPublic, setRidePostPublic] = useState(true);
  const [carPickerOpen, setCarPickerOpen] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [pinnedPostRides, setPinnedPostRides] = useState<MPinnedTemplate[]>([]);

  // driver
  const [driverCars, setDriverCars] = useState<MDriverCar[]>([]);
  const [driverAddCarOpen, setDriverAddCarOpen] = useState(false);
  const [driverFuelOpen, setDriverFuelOpen] = useState(false);
  const [driverCarDraft, setDriverCarDraft] = useState({ make: "", model: "", year: "" });
  const [driverCarLoading, setDriverCarLoading] = useState(false);
  const [driverModelsLoading, setDriverModelsLoading] = useState(false);
  const [driverYearsLoading, setDriverYearsLoading] = useState(false);
  const [driverMakeOptions, setDriverMakeOptions] = useState<string[]>([]);
  const [driverModelOptions, setDriverModelOptions] = useState<string[]>([]);
  const [driverYearOptions, setDriverYearOptions] = useState<string[]>([]);
  const [driverCarConsumption, setDriverCarConsumption] = useState("7.5");

  const [driverFriendIds, setDriverFriendIds] = useState<string[]>([]);
  const [driverSyncOpen, setDriverSyncOpen] = useState(false);
  const [driverSyncSelected, setDriverSyncSelected] = useState<Record<string, boolean>>({});

  const [driverFriendFolders, setDriverFriendFolders] = useState<MDriverFolder[]>([]);
  const [driverFolderOpen, setDriverFolderOpen] = useState(false);
  const [driverFolderName, setDriverFolderName] = useState("");
  const [driverFolderSelected, setDriverFolderSelected] = useState<Record<string, boolean>>({});

  const [driverTrips, setDriverTrips] = useState<MDriverTrip[]>([]);
  const [, setDriverTripFolders] = useState<{ id: string; name: string; tripIds: string[] }[]>([]);

  const [driverCreateTripOpen, setDriverCreateTripOpen] = useState(false);
  const [driverTripStep, setDriverTripStep] = useState<1 | 2 | 3>(1);
  const [driverTripForm, setDriverTripForm] = useState<DriverTripForm>({
    origin: "",
    destination: "",
    carId: "",
    recipientQuery: "",
    recipientIds: [],
    folderId: "",
    newFolderName: "",
  });

  const [driverTripPreviewOpen, setDriverTripPreviewOpen] = useState(false);
  const [driverTripPreview, setDriverTripPreview] = useState<DriverTripPreview | null>(null);

  const [driverTripDetailsId, setDriverTripDetailsId] = useState<string | null>(null);

  const [driverRateOpen, setDriverRateOpen] = useState(false);
  const [driverRateTarget, setDriverRateTarget] = useState<{ tripId: string | null; riderId: string | null }>({
    tripId: null,
    riderId: null,
  });
  const [driverRateValue, setDriverRateValue] = useState(5);
  const [driverRateComment, setDriverRateComment] = useState("");

  // ---- load data from Supabase on mount ----
  useEffect(() => {
    async function loadData() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;
        if (!authUser) return;

        const profile = await UserService.me().catch(() => null);
        const me: MUser = {
          id: authUser.id,
          name: profile?.full_name || authUser.email?.split("@")[0] || "You",
          email: profile?.email || authUser.email || "",
          avatar: `https://i.pravatar.cc/80?u=${authUser.id}`,
          driverRating: 0,
          driverReviewCount: 0,
          driverRidesCompleted: 0,
          riderRating: 0,
          riderReviewCount: 0,
          riderRidesCompleted: 0,
          driverReviews: [],
          riderReviews: [],
        };
        setCurrentUser(me);

        // Load connections (friends) as users
        const conns = await ConnectionService.list().catch(() => []);
        const connUsers: MUser[] = conns.map((c) => ({
          id: c.friend_id,
          name: c.friend_name || c.friend_email.split("@")[0],
          email: c.friend_email,
          avatar: `https://i.pravatar.cc/80?u=${c.friend_id}`,
          driverRating: 0,
          driverReviewCount: 0,
          driverRidesCompleted: 0,
          riderRating: 0,
          riderReviewCount: 0,
          riderRidesCompleted: 0,
          driverReviews: [],
          riderReviews: [],
        }));
        setUsers([me, ...connUsers]);

        // Load groups
        const dbGroups = await GroupService.list().catch(() => []);
        const mGroups: MGroup[] = dbGroups.map((g) => ({
          id: g.id,
          name: g.name,
          route: "",
          schedule: "",
          description: g.description,
          memberIds: Array.from(
            new Set([g.owner_id, ...g.members.map((m) => m.user_id)])
          ),
          saved: 0,
        }));
        setGroups(mGroups);

        // Load shared rides
        const dbRides = await SharedRideService.list().catch(() => []);
        const mRides: MRide[] = dbRides.map((r) => ({
          id: r.id,
          groupId: r.group_id,
          driverId: r.driver_id,
          vehicle: r.vehicle,
          origin: r.origin,
          destination: r.destination,
          departureTime: r.departure_time,
          date: r.date,
          distance: "",
          duration: "",
          approximateCost: r.approximate_cost,
          seatsTotal: r.seats_total,
          passengerIds: [],
          seatsLeft: r.seats_left,
          completed: r.completed,
        }));
        setRides(mRides);

        // Load ride requests (as rider + as driver for my rides)
        const { data: myRiderReqs } = await supabase
          .from("ride_requests")
          .select("*")
          .eq("rider_id", authUser.id);
        const myRideIds = dbRides
          .filter((r) => r.driver_id === authUser.id)
          .map((r) => r.id);
        const driverReqs =
          myRideIds.length > 0
            ? await SharedRideService.listRequests(myRideIds).catch(() => [])
            : [];
        const allReqs = [
          ...(myRiderReqs || []),
          ...driverReqs,
        ].filter(
          (v, i, a) => a.findIndex((x: any) => x.id === v.id) === i
        );
        const mRequests: MRideRequest[] = allReqs.map((r: any) => ({
          id: r.id,
          rideId: r.ride_id,
          riderId: r.rider_id,
          pickupPoint: r.pickup_point,
          dropoffPoint: r.dropoff_point,
          status: r.status as MRequestStatus,
          createdAt: new Date(r.created_at).toLocaleDateString(),
          expectedTotalCost: r.expected_total_cost,
        }));
        setRideRequests(mRequests);

        // Load cars for driver trips
        const dbCars = await CarService.list().catch(() => []);
        const mDriverCars: MDriverCar[] = dbCars.map((c) => ({
          id: c.id,
          make: c.make,
          model: c.model,
          year: String(c.year || ""),
          consumptionLPer100: c.consumption_l_100km || 7.5,
        }));
        setDriverCars(mDriverCars);
      } catch (err) {
        console.error("Error loading app data from Supabase:", err);
      }
    }
    loadData();
  }, []);

  // derived
  const ridesByGroup = useMemo(() => {
    const result: Record<string, MRide[]> = {};
    for (const g of groups) {
      result[g.id] = rides.filter((r) => r.groupId === g.id);
    }
    return result;
  }, [groups, rides]);

  const ungroupedRides = useMemo(() => rides.filter((r) => !r.groupId), [rides]);
  const connections = useMemo(
    () => users.filter((u) => u.id !== currentUser.id),
    [users, currentUser.id]
  );

  const requestBuckets = useMemo(
    () => ({
      pending: rideRequests.filter((r) => r.status === "pending"),
      approved: rideRequests.filter((r) => r.status === "approved"),
      declined: rideRequests.filter((r) => r.status === "declined"),
    }),
    [rideRequests]
  );

  const driverFriends = useMemo(
    () => driverFriendIds.map((id) => findUser(users, id)).filter(Boolean),
    [driverFriendIds, users]
  );

  const driverContacts = useMemo(
    () => users.filter((u) => u.id !== currentUser.id),
    [users, currentUser.id]
  );

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // ---- helpers ----
  const pushNotification = useCallback((title: string, body: string) => {
    setNotifications((prev) => [
      {
        id: `noti-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        title: String(title || "Notification"),
        body: String(body || ""),
        at: new Date().toLocaleString(),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const markAllNotificationsRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    []
  );
  const markNotificationRead = useCallback(
    (id: string) =>
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    []
  );
  const openNotifications = useCallback(() => setNotificationsOpen(true), []);
  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);

  const createUserFromEmail = useCallback(
    (email: string): MUser => {
      const normalized = email.trim().toLowerCase();
      const existing = users.find((u) => u.email.toLowerCase() === normalized);
      if (existing) return existing;
      const newUser: MUser = {
        id: `u${Date.now()}`,
        name: normalized.split("@")[0] || "New friend",
        email: normalized,
        avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(normalized)}`,
        driverRating: 0,
        driverReviewCount: 0,
        driverRidesCompleted: 0,
        riderRating: 0,
        riderReviewCount: 0,
        riderRidesCompleted: 0,
        driverReviews: [],
        riderReviews: [],
      };
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    },
    [users]
  );

  // ---- create group ----
  const resetCreateGroupDraft = useCallback(() => {
    setGroupDraftName("");
    setGroupDraftDesc("");
    setGroupDraftEmail("");
    setGroupDraftSelected({});
  }, []);

  const toggleGroupDraftMember = useCallback(
    (id: string) => setGroupDraftSelected((p) => ({ ...p, [id]: !p[id] })),
    []
  );

  const addGroupMemberByEmail = useCallback(() => {
    const email = groupDraftEmail.trim();
    if (!email) return;
    const u = createUserFromEmail(email);
    setGroupDraftSelected((p) => ({ ...p, [u.id]: true }));
    setGroupDraftEmail("");
  }, [groupDraftEmail, createUserFromEmail]);

  const confirmCreateGroup = useCallback(async () => {
    const name = groupDraftName.trim();
    if (!name) return;
    const selectedIds = Object.entries(groupDraftSelected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const memberIds = Array.from(new Set([currentUser.id, ...selectedIds]));

    let groupId = `grp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    try {
      const dbGroup = await GroupService.create(name, groupDraftDesc.trim() || "New group");
      groupId = dbGroup.id;
      for (const memberId of selectedIds) {
        const u = users.find((x) => x.id === memberId);
        if (u?.email) {
          await GroupService.addMember(dbGroup.id, u.email).catch(console.error);
        }
      }
    } catch (err) {
      console.error("Failed to persist group to Supabase:", err);
    }

    const newGroup: MGroup = {
      id: groupId,
      name,
      route: "",
      schedule: "",
      description: groupDraftDesc.trim() || "New group",
      memberIds,
      saved: 0,
    };
    setGroups((p) => [newGroup, ...p]);
    setCreateGroupOpen(false);
    resetCreateGroupDraft();
    pushNotification("Group created", name);
  }, [groupDraftName, groupDraftSelected, groupDraftDesc, currentUser.id, users, resetCreateGroupDraft, pushNotification]);

  // ---- friends / profile ----
  const addFriendFromProfile = useCallback(async () => {
    const email = newFriendEmail.trim();
    if (!email) return;
    try {
      const conn = await ConnectionService.add(email);
      if (conn) {
        const newUser: MUser = {
          id: conn.friend_id,
          name: conn.friend_name || conn.friend_email.split("@")[0],
          email: conn.friend_email,
          avatar: `https://i.pravatar.cc/80?u=${conn.friend_id}`,
          driverRating: 0,
          driverReviewCount: 0,
          driverRidesCompleted: 0,
          riderRating: 0,
          riderReviewCount: 0,
          riderRidesCompleted: 0,
          driverReviews: [],
          riderReviews: [],
        };
        setUsers((prev) => {
          if (prev.some((u) => u.id === newUser.id)) return prev;
          return [...prev, newUser];
        });
      } else {
        createUserFromEmail(email);
      }
    } catch {
      createUserFromEmail(email);
    }
    setNewFriendEmail("");
  }, [newFriendEmail, createUserFromEmail]);

  const joinGroup = useCallback((groupId: string) => {
    setGroups((p) =>
      p.map((g) => {
        if (g.id !== groupId) return g;
        if (g.memberIds.includes(currentUser.id)) return g;
        return { ...g, memberIds: [...g.memberIds, currentUser.id] };
      })
    );
  }, [currentUser.id]);

  const addMemberToSelectedGroup = useCallback(async () => {
    if (!selectedGroupId || !newMemberEmail.trim()) return;
    const email = newMemberEmail.trim();

    try {
      const member = await GroupService.addMember(selectedGroupId, email);
      if (member) {
        setUsers((prev) => {
          if (prev.some((u) => u.id === member.user_id)) return prev;
          return [
            ...prev,
            {
              id: member.user_id,
              name: member.display_name || email.split("@")[0],
              email: member.email,
              avatar: `https://i.pravatar.cc/80?u=${member.user_id}`,
              driverRating: 0,
              driverReviewCount: 0,
              driverRidesCompleted: 0,
              riderRating: 0,
              riderReviewCount: 0,
              riderRidesCompleted: 0,
              driverReviews: [],
              riderReviews: [],
            },
          ];
        });
        setGroups((p) =>
          p.map((g) =>
            g.id === selectedGroupId && !g.memberIds.includes(member.user_id)
              ? { ...g, memberIds: [...g.memberIds, member.user_id] }
              : g
          )
        );
      } else {
        const user = createUserFromEmail(email);
        setGroups((p) =>
          p.map((g) => {
            if (g.id !== selectedGroupId) return g;
            if (g.memberIds.includes(user.id)) return g;
            return { ...g, memberIds: [...g.memberIds, user.id] };
          })
        );
      }
    } catch {
      const user = createUserFromEmail(email);
      setGroups((p) =>
        p.map((g) => {
          if (g.id !== selectedGroupId) return g;
          if (g.memberIds.includes(user.id)) return g;
          return { ...g, memberIds: [...g.memberIds, user.id] };
        })
      );
    }
    setNewMemberEmail("");
  }, [selectedGroupId, newMemberEmail, createUserFromEmail]);

  const removeMemberFromSelectedGroup = useCallback(
    async (memberId: string) => {
      if (!selectedGroupId) return;
      setGroups((p) =>
        p.map((g) =>
          g.id === selectedGroupId
            ? { ...g, memberIds: g.memberIds.filter((id) => id !== memberId) }
            : g
        )
      );
      await GroupService.removeMember(selectedGroupId, memberId).catch(console.error);
    },
    [selectedGroupId]
  );

  const deleteGroup = useCallback(async (groupId: string) => {
    setGroups((p) => p.filter((g) => g.id !== groupId));
    setSelectedGroupId(null);
    await GroupService.delete(groupId).catch(console.error);
  }, []);

  // ---- ride detail ----
  const openRideDetail = useCallback((ride: MRide) => setSelectedRideDetail(ride), []);
  const closeRideDetail = useCallback(() => setSelectedRideDetail(null), []);

  // ---- posted ride detail / edit ----
  const openPostedRideDetail = useCallback((ride: MRide) => setSelectedPostedRide(ride), []);
  const closePostedRideDetail = useCallback(() => setSelectedPostedRide(null), []);
  const updatePostedRide = useCallback((id: string, fields: Partial<Pick<MRide, "origin" | "destination" | "departureTime" | "date" | "vehicle">>) => {
    setRides((p) => p.map((r) => r.id === id ? { ...r, ...fields } : r));
    setSelectedPostedRide((prev) => prev?.id === id ? { ...prev, ...fields } : prev);
    supabase.from("rides").update({
      origin: fields.origin,
      destination: fields.destination,
      departure_time: fields.departureTime,
      date: fields.date,
      vehicle: fields.vehicle,
    }).eq("id", id).then(({ error }) => {
      if (error) console.error("Failed to update ride:", error);
    });
  }, []);

  const markRideComplete = useCallback((id: string) => {
    setRides((p) => p.map((r) => r.id === id ? { ...r, completed: true } : r));
    setSelectedPostedRide(null);
    supabase.from("rides").update({ completed: true }).eq("id", id).then(({ error }) => {
      if (error) console.error("Failed to mark ride complete:", error);
    });
  }, []);

  // ---- join request ----
  const openJoinRequest = useCallback((ride: MRide) => {
    setSelectedRideToJoin(ride);
    setPickupPoint("");
    setDropoffPoint("");
  }, []);

  const closeJoinRequest = useCallback(() => {
    setSelectedRideToJoin(null);
    setPickupPoint("");
    setDropoffPoint("");
  }, []);

  const submitJoinRequest = useCallback(async () => {
    if (!selectedRideToJoin || !pickupPoint.trim() || !dropoffPoint.trim()) return;
    const r = selectedRideToJoin;
    const half = Number(r.approximateCost || 0) / 2;
    const localReq: MRideRequest = {
      id: `req${Date.now()}`,
      rideId: r.id,
      riderId: currentUser.id,
      pickupPoint,
      dropoffPoint,
      expectedTotalCost: Number(r.approximateCost || 0),
      maxCost: half,
      maxCostLow: half * (1 - RIDER_GAS_VARIATION_PCT),
      maxCostHigh: half * (1 + RIDER_GAS_VARIATION_PCT),
      gasVarPct: RIDER_GAS_VARIATION_PCT,
      status: "pending",
      createdAt: "Just now",
    };

    try {
      const dbReq = await SharedRideService.createRequest({
        ride_id: r.id,
        rider_id: currentUser.id,
        pickup_point: pickupPoint,
        dropoff_point: dropoffPoint,
        expected_total_cost: Number(r.approximateCost || 0),
        status: "pending",
      });
      localReq.id = dbReq.id;
    } catch (err) {
      console.error("Failed to persist ride request:", err);
    }

    setRideRequests((p) => [localReq, ...p]);
    closeJoinRequest();
    pushNotification("Request sent", `${r.origin} → ${r.destination} · waiting for driver approval`);
  }, [selectedRideToJoin, pickupPoint, dropoffPoint, currentUser.id, closeJoinRequest, pushNotification]);

  // ---- driver approve/decline ----
  const approveRideRequest = useCallback(
    async (requestId: string) => {
      const req = rideRequests.find((r) => r.id === requestId);
      if (!req) return;
      const ride = rides.find((r) => r.id === req.rideId);
      if (!ride) return;
      const nextPassengerIds = [...(ride.passengerIds || [])];
      if (!nextPassengerIds.includes(req.riderId)) nextPassengerIds.push(req.riderId);
      const passengerCap = Math.max((ride.seatsTotal || 0) - 1, 0);
      const nextSeatsLeft = Math.max(passengerCap - nextPassengerIds.length, 0);
      const confirmationId = `conf${Date.now()}`;

      setRideRequests((p) => p.map((r) => (r.id === requestId ? { ...r, status: "approved" } : r)));
      setRides((p) =>
        p.map((r) =>
          r.id === ride.id ? { ...r, passengerIds: nextPassengerIds, seatsLeft: nextSeatsLeft } : r
        )
      );
      setConfirmedRides((p) => [
        {
          id: confirmationId,
          rideId: ride.id,
          requestId,
          riderId: req.riderId,
          pickupPoint: req.pickupPoint,
          dropoffPoint: req.dropoffPoint,
          status: "confirmed",
          occupiedSeats: Math.min(nextPassengerIds.length, passengerCap),
          messages: ["Driver approved your pickup and drop-off points."],
          completionAsked: false,
          completed: false,
          reviewSubmitted: false,
        },
        ...p,
      ]);
      setUpcomingTrips((p) => {
        const exists = p.some(
          (t) => t.confirmationId === confirmationId || (t.rideId === ride.id && t.kind === "rider")
        );
        if (exists) return p;
        return [
          {
            id: `up-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            kind: "rider",
            rideId: ride.id,
            confirmationId,
            route: `${ride.origin} → ${ride.destination}`,
            date: ride.date,
            time: ride.departureTime,
            cancellableUntil: "",
            canCancel: true,
          },
          ...p,
        ];
      });

      await SharedRideService.updateRequestStatus(requestId, "approved").catch(console.error);
      await SharedRideService.updateSeatCount(ride.id, nextSeatsLeft).catch(console.error);

      pushNotification("Request approved", `${ride.origin} → ${ride.destination} · pickup confirmed`);
    },
    [rideRequests, rides, pushNotification]
  );

  const declineRideRequest = useCallback(
    async (requestId: string) => {
      const req = rideRequests.find((r) => r.id === requestId);
      const ride = req ? rides.find((x) => x.id === req.rideId) : null;
      setRideRequests((p) => p.map((r) => (r.id === requestId ? { ...r, status: "declined" } : r)));
      await SharedRideService.updateRequestStatus(requestId, "declined").catch(console.error);
      if (ride) pushNotification("Request declined", `${ride.origin} → ${ride.destination}`);
    },
    [rideRequests, rides, pushNotification]
  );

  const reassignDriver = useCallback((rideId: string, newDriverId: string) => {
    setRides((p) => p.map((r) => r.id === rideId ? { ...r, driverId: newDriverId } : r));
    supabase.from("rides").update({ driver_id: newDriverId }).eq("id", rideId).then(({ error }) => {
      if (error) console.error("Failed to reassign driver:", error);
    });
  }, []);

  // ---- confirmation actions ----
  const cancelConfirmedRide = useCallback(
    (confirmationId: string) =>
      setConfirmedRides((p) =>
        p.map((c) => (c.id === confirmationId ? { ...c, status: "cancelled" } : c))
      ),
    []
  );

  const sendQuickMessage = useCallback(
    (confirmationId: string, message: string) =>
      setConfirmedRides((p) =>
        p.map((c) =>
          c.id === confirmationId ? { ...c, messages: [...c.messages, `You: ${message}`] } : c
        )
      ),
    []
  );

  const markRideCompletion = useCallback(
    (confirmationId: string, happened: boolean) =>
      setConfirmedRides((p) =>
        p.map((c) =>
          c.id === confirmationId
            ? {
                ...c,
                completionAsked: true,
                completed: happened,
                status: happened ? "completed" : "cancelled",
              }
            : c
        )
      ),
    []
  );

  const submitDriverReview = useCallback(
    (confirmationId: string) => {
      const conf = confirmedRides.find((c) => c.id === confirmationId);
      const ride = rides.find((r) => r.id === conf?.rideId);
      if (!conf || !ride) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== ride.driverId) return u;
          const prevTotal = (u.driverRating || 0) * (u.driverReviewCount || 0);
          const nextCount = (u.driverReviewCount || 0) + 1;
          const nextRating = (prevTotal + reviewRating) / nextCount;
          return {
            ...u,
            driverRating: nextRating,
            driverReviewCount: nextCount,
            driverReviews: [
              {
                id: `drv${Date.now()}`,
                reviewer: currentUser.name,
                rating: reviewRating,
                comment: reviewComment || "Great ride.",
              },
              ...(u.driverReviews || []),
            ],
          };
        })
      );
      setConfirmedRides((p) =>
        p.map((c) => (c.id === confirmationId ? { ...c, reviewSubmitted: true } : c))
      );
      setReviewRating(5);
      setReviewComment("");
    },
    [confirmedRides, rides, reviewRating, reviewComment, currentUser.name]
  );

  // ---- upcoming trip cancel ----
  const openCancelConfirm = useCallback((trip: MUpcomingTrip) => {
    setCancelTarget(trip);
    setSelectedConfirmationId(null);
    setSelectedRequestId(null);
    setDriverTripDetailsId(null);
  }, []);

  const confirmCancelUpcomingTrip = useCallback(() => {
    const trip = cancelTarget;
    if (!trip) return;
    setUpcomingTrips((p) => p.filter((t) => t.id !== trip.id));
    if (trip.kind === "rider") {
      const match =
        (trip.confirmationId ? confirmedRides.find((c) => c.id === trip.confirmationId) : null) ||
        (trip.rideId
          ? confirmedRides.find((c) => c.rideId === trip.rideId && c.riderId === currentUser.id)
          : null);
      if (match) {
        const ride = rides.find((r) => r.id === match.rideId);
        setConfirmedRides((p) =>
          p.map((c) =>
            c.id === match.id
              ? {
                  ...c,
                  status: "cancelled",
                  messages: [
                    ...(c.messages || []),
                    "System: Rider cancelled this ride. Driver notified.",
                  ],
                }
              : c
          )
        );
        if (ride)
          pushNotification("Ride cancelled", `${ride.origin} → ${ride.destination} · driver notified`);
      }
    }
    setCancelTarget(null);
  }, [cancelTarget, confirmedRides, rides, currentUser.id, pushNotification]);

  const openRequestDetailsFromRequest = useCallback(
    (req: MRideRequest) => {
      if (req.status === "approved") {
        const conf =
          confirmedRides.find((c) => c.requestId === req.id) ||
          confirmedRides.find((c) => c.rideId === req.rideId && c.riderId === req.riderId);
        if (conf) {
          setSelectedRequestId(null);
          setSelectedConfirmationId(conf.id);
          return;
        }
      }
      setSelectedConfirmationId(null);
      setSelectedRequestId(req.id);
    },
    [confirmedRides]
  );

  const openRideDetailsFromUpcoming = useCallback(
    (trip: MUpcomingTrip) => {
      if (trip.kind === "driver" && trip.driverTripId) {
        setDriverTripDetailsId(trip.driverTripId);
        return;
      }
      if (trip.confirmationId) {
        const byId = confirmedRides.find((c) => c.id === trip.confirmationId);
        if (byId) {
          setSelectedConfirmationId(byId.id);
          return;
        }
      }
      if (trip.rideId) {
        const byRide = confirmedRides.find((c) => c.rideId === trip.rideId);
        if (byRide) setSelectedConfirmationId(byRide.id);
      }
    },
    [confirmedRides]
  );

  // ---- post ride ----
  const resetRidePostTargets = useCallback(() => {
    setRidePostGroupSelected({});
    setRidePostPublic(true);
  }, []);

  const openCarPicker = useCallback(() => {
    resetRidePostTargets();
    setCarPickerOpen(true);
  }, [resetRidePostTargets]);

  const closeCarPicker = useCallback(() => setCarPickerOpen(false), []);

  const selectCarForPosting = useCallback(
    (car: MCarOwned) => {
      setSelectedCarForRide(car);
      setNewRideForm({ origin: "", destination: "", time: "" });
      resetRidePostTargets();
      setCarPickerOpen(false);
    },
    [resetRidePostTargets]
  );

  const closeRideCreation = useCallback(() => {
    setSelectedCarForRide(null);
    setNewRideForm({ origin: "", destination: "", time: "", date: "" });
    resetRidePostTargets();
  }, [resetRidePostTargets]);

  const toggleRidePostGroup = useCallback(
    (id: string) => setRidePostGroupSelected((p) => ({ ...p, [id]: !p[id] })),
    []
  );

  const postRideOffer = useCallback(async () => {
    if (!selectedCarForRide) return;
    const origin = newRideForm.origin.trim();
    const destination = newRideForm.destination.trim();
    const time = newRideForm.time.trim() || "TBD";
    const date = newRideForm.date.trim() || "TBD";
    if (!origin || !destination) {
      pushNotification("Missing info", "Please enter an origin and destination.");
      return;
    }
    const selectedGroupIds = Object.entries(ridePostGroupSelected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const targets: (string | null)[] = [];
    if (ridePostPublic) targets.push(null);
    selectedGroupIds.forEach((id) => targets.push(id));
    if (targets.length === 0) {
      pushNotification(
        "Choose a posting target",
        "Select at least one group and/or No group (available to all)."
      );
      return;
    }
    const distanceKm = driverEstimateDistanceKm(origin, destination);
    const distance = `${distanceKm.toFixed(1)} km`;
    const duration =
      distanceKm === 12.4 ? "32 min" : distanceKm === 8.7 ? "18 min" : distanceKm > 0 ? "25 min" : "TBD";
    const seatsTotal = Math.max(Number(selectedCarForRide.seats || 4), 1);
    const passengerCapacity = Math.max(seatsTotal - 1, 0);
    const approxCost =
      Math.round(distanceKm * Number(selectedCarForRide.costPerKm || 0.18) * 100) / 100;

    const newRides: MRide[] = [];
    for (const groupId of targets) {
      let rideId = driverId("ride");
      try {
        const dbRide = await SharedRideService.create({
          driver_id: currentUser.id,
          group_id: groupId,
          vehicle: selectedCarForRide.name,
          origin,
          destination,
          departure_time: time,
          date: date,
          approximate_cost: approxCost,
          seats_total: seatsTotal,
          seats_left: passengerCapacity,
        });
        rideId = dbRide.id;
      } catch (err) {
        console.error("Failed to persist ride to Supabase:", err);
      }
      newRides.push({
        id: rideId,
        groupId,
        driverId: currentUser.id,
        vehicle: selectedCarForRide.name,
        origin,
        destination,
        departureTime: time,
        date: date,
        distance,
        duration,
        approximateCost: approxCost,
        seatsTotal,
        passengerIds: [],
        seatsLeft: passengerCapacity,
      });
    }

    setRides((p) => [...newRides, ...p]);
    const label = [
      ridePostPublic ? "public" : null,
      ...selectedGroupIds.map((id) => groups.find((g) => g.id === id)?.name || "group"),
    ]
      .filter(Boolean)
      .join(", ");
    pushNotification("Ride posted", `${origin} → ${destination} · ${label}`);
    closeRideCreation();
  }, [
    selectedCarForRide,
    newRideForm,
    ridePostGroupSelected,
    ridePostPublic,
    groups,
    currentUser.id,
    closeRideCreation,
    pushNotification,
  ]);

  const togglePinPastTrip = useCallback(
    (route: string, date: string, id: string) =>
      setPinnedPostRides((prev) =>
        prev.some((pin) => pin.route === route)
          ? prev.filter((pin) => pin.route !== route)
          : [{ id: `pin-${id}`, route, schedule: `Pinned from ${date}`, cost: 0 }, ...prev]
      ),
    []
  );

  const isRoutePinned = useCallback(
    (route: string) => pinnedPostRides.some((pin) => pin.route === route),
    [pinnedPostRides]
  );

  // ---- driver cars ----
  const driverResetCarDraft = useCallback(async () => {
    setDriverCarLoading(true);
    const makes = await CarService.listMakes();

    setDriverMakeOptions(makes);
    setDriverModelOptions([]);
    setDriverYearOptions([]);
    setDriverCarDraft({ make: "", model: "", year: "" });
    setDriverCarConsumption("7.5");
    setDriverCarLoading(false);
  }, []);

  const openDriverAddCar = useCallback(() => {
    driverResetCarDraft();
    setDriverAddCarOpen(true);
  }, [driverResetCarDraft]);

  const selectDriverCarMake = useCallback(async (make: string) => {
    setDriverCarDraft({ make, model: "", year: "" });
    setDriverModelOptions([]);
    setDriverYearOptions([]);
    setDriverModelsLoading(true);
    const models = await CarService.listModels(make);
    setDriverModelOptions(models);
    setDriverModelsLoading(false);
  }, []);

  const selectDriverCarModel = useCallback(
    async (model: string) => {
      const make = driverCarDraft.make;
      setDriverCarDraft((prev) => ({ ...prev, model, year: "" }));
      setDriverYearOptions([]);
      setDriverYearsLoading(true);
      const years = await CarService.listYears(make, model);
      setDriverYearOptions(years.map(String));
      setDriverYearsLoading(false);
    },
    [driverCarDraft.make],
  );

  const selectDriverCarYear = useCallback((year: string) => {
    setDriverCarDraft((prev) => ({ ...prev, year }));
  }, []);

  const confirmDriverCarBasic = useCallback(async () => {
    if (!driverCarDraft.make || !driverCarDraft.model || !driverCarDraft.year) return;
    const consumption = await CarService.fetchConsumption(
      driverCarDraft.make,
      driverCarDraft.model,
      Number(driverCarDraft.year),
    );
    setDriverCarConsumption(consumption != null ? String(consumption) : "7.5");
    setDriverAddCarOpen(false);
    setDriverFuelOpen(true);
  }, [driverCarDraft]);

  const confirmDriverCarFuel = useCallback(async () => {
    const cons = Number(driverCarConsumption);
    if (!Number.isFinite(cons) || cons <= 0) return;

    let newCarId = driverId("car");
    try {
      const created = await CarService.create({
        id: "",
        make: driverCarDraft.make,
        model: driverCarDraft.model,
        year: Number(driverCarDraft.year) || new Date().getFullYear(),
        consumption_l_100km: cons,
        fuel_efficiency: 0,
      });
      newCarId = created.id;
    } catch (err) {
      console.error("Failed to persist car to Supabase:", err);
    }

    const newCar: MDriverCar = {
      id: newCarId,
      make: driverCarDraft.make,
      model: driverCarDraft.model,
      year: driverCarDraft.year,
      consumptionLPer100: cons,
    };
    setDriverCars((p) => [newCar, ...p]);
    setDriverFuelOpen(false);
  }, [driverCarConsumption, driverCarDraft]);

  // ---- driver friends ----
  const toggleDriverSyncUser = useCallback(
    (id: string) => setDriverSyncSelected((p) => ({ ...p, [id]: !p[id] })),
    []
  );

  const confirmDriverSyncContacts = useCallback(() => {
    const selectedIds = Object.entries(driverSyncSelected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    setDriverFriendIds((prev) => {
      const s = new Set(prev);
      selectedIds.forEach((id) => s.add(id));
      return Array.from(s);
    });
    setDriverSyncSelected({});
    setDriverSyncOpen(false);
  }, [driverSyncSelected]);

  const openDriverCreateFolder = useCallback(() => {
    setDriverFolderName("");
    setDriverFolderSelected({});
    setDriverFolderOpen(true);
  }, []);

  const toggleDriverFolderMember = useCallback(
    (id: string) => setDriverFolderSelected((p) => ({ ...p, [id]: !p[id] })),
    []
  );

  const confirmDriverCreateFolder = useCallback(() => {
    const name = driverFolderName.trim();
    if (!name) return;
    const memberIds = Object.entries(driverFolderSelected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (memberIds.length === 0) return;
    setDriverFriendFolders((prev) => [{ id: driverId("folder"), name, memberIds }, ...prev]);
    setDriverFolderOpen(false);
  }, [driverFolderName, driverFolderSelected]);

  // ---- driver trip wizard ----
  const openDriverTripWizard = useCallback(() => {
    setDriverTripStep(1);
    setDriverTripForm({
      origin: "",
      destination: "",
      carId: "",
      recipientQuery: "",
      recipientIds: [],
      folderId: "",
      newFolderName: "",
    });
    setDriverCreateTripOpen(true);
  }, []);

  const driverTripBack = useCallback(
    () => setDriverTripStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3)),
    []
  );

  const addDriverRecipient = useCallback(
    (id: string) =>
      setDriverTripForm((p) =>
        p.recipientIds.includes(id)
          ? p
          : { ...p, recipientIds: [...p.recipientIds, id], recipientQuery: "" }
      ),
    []
  );

  const removeDriverRecipient = useCallback(
    (id: string) =>
      setDriverTripForm((p) => ({
        ...p,
        recipientIds: p.recipientIds.filter((x) => x !== id),
      })),
    []
  );

  const applyDriverFolderMembers = useCallback(
    (folderId: string) => {
      const folder = driverFriendFolders.find((f) => f.id === folderId);
      if (!folder) return;
      setDriverTripForm((p) => {
        const s = new Set(p.recipientIds);
        folder.memberIds.forEach((id) => s.add(id));
        return { ...p, folderId, recipientIds: Array.from(s) };
      });
    },
    [driverFriendFolders]
  );

  const driverTripNext = useCallback(() => {
    if (driverTripStep === 1) {
      if (!driverTripForm.origin.trim() || !driverTripForm.destination.trim()) return;
      setDriverTripStep(2);
      return;
    }
    if (driverTripStep === 2) {
      if (!driverTripForm.carId) return;
      setDriverTripStep(3);
      return;
    }
    if (driverTripStep === 3) {
      if (driverTripForm.recipientIds.length === 0) return;
      const car = driverCars.find((c) => c.id === driverTripForm.carId);
      const distanceKm = driverEstimateDistanceKm(driverTripForm.origin, driverTripForm.destination);
      const costs = computeDriverTripCosts({
        distanceKm,
        consumptionLPer100: car?.consumptionLPer100 || 0,
        riderCount: driverTripForm.recipientIds.length,
      });
      setDriverTripPreview({
        origin: driverTripForm.origin,
        destination: driverTripForm.destination,
        car,
        distanceKm,
        totalCost: costs.totalCost,
        perRider: costs.perRider,
        driverSavings: costs.driverSavings,
        folderId: driverTripForm.folderId,
        newFolderName: driverTripForm.newFolderName,
        recipientIds: driverTripForm.recipientIds,
      });
      setDriverCreateTripOpen(false);
      setDriverTripPreviewOpen(true);
    }
  }, [driverTripStep, driverTripForm, driverCars]);

  const confirmDriverTripSend = useCallback(() => {
    if (!driverTripPreview || !driverTripPreview.car) return;
    let folderId = driverTripPreview.folderId;
    const folderName = String(driverTripPreview.newFolderName || "").trim();
    if (!folderId && folderName) {
      folderId = driverId("tripfolder");
      setDriverTripFolders((prev) => [{ id: folderId, name: folderName, tripIds: [] }, ...prev]);
    }
    const tripId = driverId("trip");
    const paidById: Record<string, boolean> = {};
    driverTripPreview.recipientIds.forEach((id) => (paidById[id] = false));
    const newTrip: MDriverTrip = {
      id: tripId,
      origin: driverTripPreview.origin,
      destination: driverTripPreview.destination,
      carId: driverTripPreview.car.id,
      carLabel: `${driverTripPreview.car.year} ${driverTripPreview.car.make} ${driverTripPreview.car.model}`,
      consumptionLPer100: driverTripPreview.car.consumptionLPer100,
      distanceKm: driverTripPreview.distanceKm,
      totalCost: driverTripPreview.totalCost,
      driverSavings: driverTripPreview.driverSavings,
      perRiderCost: driverTripPreview.perRider,
      createdAt: new Date().toLocaleString(),
      folderId: folderId || "",
      recipientIds: driverTripPreview.recipientIds,
      paidById,
      ratingsById: {},
    };
    setDriverTrips((p) => [newTrip, ...p]);
    if (folderId) {
      setDriverTripFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, tripIds: [tripId, ...(f.tripIds || [])] } : f))
      );
    }
    setUpcomingTrips((p) => [
      {
        id: driverId("updrv"),
        kind: "driver",
        driverTripId: tripId,
        route: `${newTrip.origin} → ${newTrip.destination}`,
        date: "Upcoming",
        time: "TBD",
        cancellableUntil: "",
        canCancel: true,
      },
      ...p,
    ]);
    setDriverTripPreviewOpen(false);
    setDriverTripPreview(null);
    setDriverTripDetailsId(tripId);
  }, [driverTripPreview]);

  const toggleDriverPaid = useCallback((tripId: string, riderId: string) => {
    setDriverTrips((prev) =>
      prev.map((t) =>
        t.id !== tripId ? t : { ...t, paidById: { ...t.paidById, [riderId]: !t.paidById[riderId] } }
      )
    );
  }, []);

  const openDriverRate = useCallback((tripId: string, riderId: string) => {
    setDriverRateTarget({ tripId, riderId });
    setDriverRateValue(5);
    setDriverRateComment("");
    setDriverRateOpen(true);
  }, []);

  const confirmDriverRate = useCallback(() => {
    const { tripId, riderId } = driverRateTarget;
    if (!tripId || !riderId) return;
    setDriverTrips((prev) =>
      prev.map((t) =>
        t.id !== tripId
          ? t
          : {
              ...t,
              ratingsById: {
                ...t.ratingsById,
                [riderId]: {
                  rating: driverRateValue,
                  comment: driverRateComment.trim(),
                  at: new Date().toLocaleString(),
                },
              },
            }
      )
    );
    setDriverRateOpen(false);
  }, [driverRateTarget, driverRateValue, driverRateComment]);

  const value: AppContextValue = {
    currentUser,
    users,
    groups,
    rides,
    rideRequests,
    confirmedRides,
    upcomingTrips,
    connections,
    ridesByGroup,
    ungroupedRides,
    requestBuckets,
    selectedGroupId,
    setSelectedGroupId,
    selectedConfirmationId,
    setSelectedConfirmationId,
    selectedRequestId,
    setSelectedRequestId,
    cancelTarget,
    setCancelTarget,
    notifications,
    notificationsOpen,
    unreadNotificationsCount,
    pushNotification,
    openNotifications,
    closeNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    createGroupOpen,
    setCreateGroupOpen,
    groupDraftName,
    setGroupDraftName,
    groupDraftDesc,
    setGroupDraftDesc,
    groupDraftEmail,
    setGroupDraftEmail,
    groupDraftSelected,
    toggleGroupDraftMember,
    addGroupMemberByEmail,
    confirmCreateGroup,
    resetCreateGroupDraft,
    newMemberEmail,
    setNewMemberEmail,
    addMemberToSelectedGroup,
    removeMemberFromSelectedGroup,
    deleteGroup,
    joinGroup,
    selectedRideDetail,
    openRideDetail,
    closeRideDetail,
    selectedRideToJoin,
    pickupPoint,
    setPickupPoint,
    dropoffPoint,
    setDropoffPoint,
    openJoinRequest,
    closeJoinRequest,
    submitJoinRequest,
    approveRideRequest,
    declineRideRequest,
    reassignDriver,
    cancelConfirmedRide,
    sendQuickMessage,
    markRideCompletion,
    submitDriverReview,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    openCancelConfirm,
    confirmCancelUpcomingTrip,
    openRequestDetailsFromRequest,
    openRideDetailsFromUpcoming,
    selectedCarForRide,
    newRideForm,
    setNewRideForm,
    ridePostGroupSelected,
    toggleRidePostGroup,
    ridePostPublic,
    setRidePostPublic,
    carPickerOpen,
    openCarPicker,
    closeCarPicker,
    selectCarForPosting,
    closeRideCreation,
    postRideOffer,
    pinnedPostRides,
    togglePinPastTrip,
    isRoutePinned,
    profileView,
    setProfileView,
    selectedProfileUserId,
    setSelectedProfileUserId,
    newFriendEmail,
    setNewFriendEmail,
    addFriendFromProfile,
    driverCars,
    driverAddCarOpen,
    openDriverAddCar,
    setDriverAddCarOpen,
    driverFuelOpen,
    setDriverFuelOpen,
    driverCarDraft,
    driverCarLoading,
    driverModelsLoading,
    driverYearsLoading,
    driverMakeOptions,
    driverModelOptions,
    driverYearOptions,
    selectDriverCarMake,
    selectDriverCarModel,
    selectDriverCarYear,
    driverCarConsumption,
    setDriverCarConsumption,
    confirmDriverCarBasic,
    confirmDriverCarFuel,
    driverFriendIds,
    driverFriends,
    driverContacts,
    driverSyncOpen,
    setDriverSyncOpen,
    driverSyncSelected,
    toggleDriverSyncUser,
    confirmDriverSyncContacts,
    driverFriendFolders,
    driverFolderOpen,
    openDriverCreateFolder,
    setDriverFolderOpen,
    driverFolderName,
    setDriverFolderName,
    driverFolderSelected,
    toggleDriverFolderMember,
    confirmDriverCreateFolder,
    driverTrips,
    driverCreateTripOpen,
    setDriverCreateTripOpen,
    driverTripStep,
    setDriverTripStep,
    driverTripForm,
    setDriverTripForm,
    openDriverTripWizard,
    driverTripBack,
    driverTripNext,
    addDriverRecipient,
    removeDriverRecipient,
    applyDriverFolderMembers,
    driverTripPreviewOpen,
    setDriverTripPreviewOpen,
    driverTripPreview,
    confirmDriverTripSend,
    driverTripDetailsId,
    setDriverTripDetailsId,
    toggleDriverPaid,
    driverRateOpen,
    setDriverRateOpen,
    driverRateTarget,
    openDriverRate,
    driverRateValue,
    setDriverRateValue,
    driverRateComment,
    setDriverRateComment,
    confirmDriverRate,
    selectedPostedRide,
    openPostedRideDetail,
    closePostedRideDetail,
    updatePostedRide,
    markRideComplete,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
