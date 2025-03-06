import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import styles from './caregiverList.module.css';
import { MapPin, Clock, Briefcase, Search, Users, Filter } from 'lucide-react';

function CaregiverListPage() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: '',
    workType: '',
    preferredTime: '',
    contractType: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/caregivers");
        setCaregivers(response.data);
        setError(null);
      } catch (err) {
        setError("케어기버 목록을 불러오는 중 오류가 발생했습니다.");
        console.error("Error fetching caregivers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaregivers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const filteredCaregivers = caregivers.filter(caregiver => {
    // 검색어 필터링
    const matchesSearch = caregiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          caregiver.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          caregiver.location.toLowerCase().includes(searchTerm.toLowerCase());

    // 필터 적용
    const matchesLocation = !filters.location || caregiver.location.includes(filters.location);
    const matchesWorkType = !filters.workType || caregiver.workType === filters.workType;
    const matchesPreferredTime = !filters.preferredTime || caregiver.preferredTime === filters.preferredTime;
    const matchesContractType = !filters.contractType || caregiver.contractType === filters.contractType;

    return matchesSearch && matchesLocation && matchesWorkType && matchesPreferredTime && matchesContractType;
  });

  // 근무 유형 한글화
  const workTypeLabel = {
    'RESIDENT': '입주',
    'COMMUTE': '출퇴근'
  };

  // 선호 시간대 한글화
  const preferredTimeLabel = {
    'MORNING': '오전',
    'AFTERNOON': '오후',
    'EVENING': '저녁'
  };

  // 계약 유형 한글화
  const contractTypeLabel = {
    'CONTRACT': '정규직',
    'TEMPORARY': '임시직'
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>케어기버 목록을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.caregiverListContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>케어기버 찾기</h1>
        <p className={styles.subtitle}>당신에게 맞는 케어기버를 찾아보세요</p>
      </div>

      <div className={styles.searchAndFilterContainer}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="이름, 지역, 전문분야로 검색"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.filterToggleButton}
          onClick={toggleFilters}
          aria-expanded={showFilters}
        >
          <Filter size={18} />
          <span>필터</span>
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersContainer}>
          <div className={styles.filterItem}>
            <label htmlFor="location" className={styles.filterLabel}>지역</label>
            <select
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">전체 지역</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="workType" className={styles.filterLabel}>근무 형태</label>
            <select
              id="workType"
              name="workType"
              value={filters.workType}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">전체</option>
              <option value="RESIDENT">입주</option>
              <option value="COMMUTE">출퇴근</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="preferredTime" className={styles.filterLabel}>선호 시간대</label>
            <select
              id="preferredTime"
              name="preferredTime"
              value={filters.preferredTime}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">전체</option>
              <option value="MORNING">오전</option>
              <option value="AFTERNOON">오후</option>
              <option value="EVENING">저녁</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="contractType" className={styles.filterLabel}>계약 형태</label>
            <select
              id="contractType"
              name="contractType"
              value={filters.contractType}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">전체</option>
              <option value="CONTRACT">정규직</option>
              <option value="TEMPORARY">임시직</option>
            </select>
          </div>
        </div>
      )}

      <div className={styles.resultCount}>
        <Users size={16} />
        <span>{filteredCaregivers.length}명의 케어기버</span>
      </div>

      <div className={styles.caregiverGrid}>
        {filteredCaregivers.length > 0 ? (
          filteredCaregivers.map(caregiver => (
            <Link to={`/caregiver/${caregiver.id}`} key={caregiver.id} className={styles.caregiverCard}>
              <div className={styles.caregiverImageContainer}>
                <img
                  src={caregiver.profileImage || "/default-avatar.png"}
                  alt={`${caregiver.name} 프로필`}
                  className={styles.caregiverImage}
                />
                <div className={styles.statusBadge}
                  data-status={caregiver.status === 'OPEN' ? 'available' : 'unavailable'}>
                  {caregiver.status === 'OPEN' ? '모집중' : '모집완료'}
                </div>
              </div>

              <div className={styles.caregiverInfo}>
                <h2 className={styles.caregiverName}>{caregiver.name}</h2>
                <p className={styles.caregiverSpecialization}>{caregiver.specialization}</p>

                <div className={styles.detailsContainer}>
                  <div className={styles.detailItem}>
                    <MapPin size={16} className={styles.detailIcon} />
                    <span>{caregiver.location}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <Briefcase size={16} className={styles.detailIcon} />
                    <span>{workTypeLabel[caregiver.workType]}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <Clock size={16} className={styles.detailIcon} />
                    <span>{preferredTimeLabel[caregiver.preferredTime]}</span>
                  </div>
                </div>

                <div className={styles.pricingContainer}>
                  <div className={styles.salary}>
                    <span className={styles.salaryLabel}>기본 급여</span>
                    <span className={styles.salaryAmount}>{caregiver.salary.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>검색 결과가 없습니다.</p>
            <p>다른 검색어나 필터 조건을 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CaregiverListPage;
