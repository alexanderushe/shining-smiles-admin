import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Campus {
  id: string
  name: string
  address?: string
  phone?: string
  principal?: string
  studentCount?: number
  revenueCollected?: number
  status?: "active" | "inactive"
  createdAt?: string
}

export interface ClassGrade {
  id: string
  name: string
  campusId: string
  capacity: number
  currentEnrollment: number
  teacherName?: string
  roomNumber?: string
  tuitionFee: number
  status: "active" | "inactive"
  createdAt?: string
}

const DEFAULT_CAMPUSES: Campus[] = [
  { id: "all", name: "All Campuses" },
  { id: "main", name: "Main Campus" },
  { id: "north", name: "North Campus" },
  { id: "south", name: "South Campus" },
  { id: "east", name: "East Campus" },
  { id: "west", name: "West Campus" },
]

const DEFAULT_CLASSES: ClassGrade[] = [
  {
    id: "cls-1",
    name: "Grade 1",
    campusId: "main",
    capacity: 30,
    currentEnrollment: 28,
    teacherName: "Mrs. Johnson",
    roomNumber: "101",
    tuitionFee: 5000,
    status: "active",
  },
  {
    id: "cls-2",
    name: "Grade 2",
    campusId: "main",
    capacity: 30,
    currentEnrollment: 25,
    teacherName: "Mr. Davis",
    roomNumber: "102",
    tuitionFee: 5000,
    status: "active",
  },
  {
    id: "cls-3",
    name: "Grade 3",
    campusId: "north",
    capacity: 28,
    currentEnrollment: 27,
    teacherName: "Ms. Wilson",
    roomNumber: "201",
    tuitionFee: 5200,
    status: "active",
  },
  {
    id: "cls-4",
    name: "Grade 4",
    campusId: "south",
    capacity: 32,
    currentEnrollment: 30,
    teacherName: "Mrs. Brown",
    roomNumber: "301",
    tuitionFee: 5500,
    status: "active",
  },
  {
    id: "cls-5",
    name: "Grade 5",
    campusId: "east",
    capacity: 30,
    currentEnrollment: 22,
    teacherName: "Mr. Taylor",
    roomNumber: "401",
    tuitionFee: 5800,
    status: "active",
  },
]

type CampusId = string

interface CampusContextType {
  selectedCampus: CampusId
  setSelectedCampus: (campus: CampusId) => void
  campuses: Campus[]
  addCampus: (campus: Campus) => void
  updateCampus: (id: string, campus: Partial<Campus>) => void
  removeCampus: (id: string) => void
  classes: ClassGrade[]
  addClass: (classGrade: ClassGrade) => void
  updateClass: (id: string, classGrade: Partial<ClassGrade>) => void
  removeClass: (id: string) => void
}

const CampusContext = createContext<CampusContextType | undefined>(undefined)

export function CampusProvider({ children }: { children: ReactNode }) {
  const [selectedCampus, setSelectedCampus] = useState<CampusId>("all")
  const [campuses, setCampuses] = useState<Campus[]>(DEFAULT_CAMPUSES)
  const [classes, setClasses] = useState<ClassGrade[]>(DEFAULT_CLASSES)

  useEffect(() => {
    // Fetch real campuses from API
    const fetchCampuses = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/students/campuses/', {
          headers: {
            'Authorization': `Token ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Add "All Campuses" option at the beginning
          const campusesWithAll = [
            { id: 'all', name: 'All Campuses' },
            ...data.map((c: any) => ({
              id: c.id.toString(),
              name: c.name,
              address: c.address,
              phone: c.phone,
              principal: c.principal,
            }))
          ];
          setCampuses(campusesWithAll);
        } else {
          console.warn('Failed to fetch campuses, using defaults');
        }
      } catch (error) {
        console.error('Error fetching campuses:', error);
        // Keep default campuses on error
      }
    };

    fetchCampuses();

    // Load classes from localStorage (keep as is for now)
    const storedClasses = localStorage.getItem("school_classes")
    if (storedClasses) {
      try {
        const parsed = JSON.parse(storedClasses)
        setClasses(parsed)
      } catch (error) {
        console.error("Failed to load classes from storage:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("school_campuses", JSON.stringify(campuses))
  }, [campuses])

  useEffect(() => {
    localStorage.setItem("school_classes", JSON.stringify(classes))
  }, [classes])

  const addCampus = (campus: Campus) => {
    setCampuses((prev) => [...prev, campus])
  }

  const updateCampus = (id: string, updates: Partial<Campus>) => {
    setCampuses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const removeCampus = (id: string) => {
    setCampuses((prev) => prev.filter((c) => c.id !== id))
  }

  const addClass = (classGrade: ClassGrade) => {
    setClasses((prev) => [...prev, classGrade])
  }

  const updateClass = (id: string, updates: Partial<ClassGrade>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const removeClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <CampusContext.Provider
      value={{
        selectedCampus,
        setSelectedCampus,
        campuses,
        addCampus,
        updateCampus,
        removeCampus,
        classes,
        addClass,
        updateClass,
        removeClass,
      }}
    >
      {children}
    </CampusContext.Provider>
  )
}

export function useCampus() {
  const context = useContext(CampusContext)
  if (!context) {
    throw new Error("useCampus must be used within CampusProvider")
  }
  return context
}

export const CAMPUSES = DEFAULT_CAMPUSES
