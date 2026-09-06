from decimal import Decimal


class AllocationScorer:
    """
    Calculates how well a faculty member matches an allocation.

    The scoring system balances:
        1. Subject preferences
        2. Section preferences
        3. Time-slot preferences
        4. Faculty workload fairness
    """

    SUBJECT_PRIORITY_SCORES = {
        1: Decimal("30"),
        2: Decimal("25"),
        3: Decimal("20"),
        4: Decimal("15"),
        5: Decimal("10"),
    }

    SECTION_PRIORITY_SCORES = {
        1: Decimal("15"),
        2: Decimal("12"),
        3: Decimal("9"),
        4: Decimal("6"),
        5: Decimal("3"),
    }

    TIME_SLOT_PRIORITY_SCORES = {
        1: Decimal("10"),
        2: Decimal("8"),
        3: Decimal("6"),
        4: Decimal("4"),
        5: Decimal("2"),
    }

    UNDERLOADED_BONUS = Decimal("30")
    PREFERRED_WORKLOAD_BONUS = Decimal("20")
    WITHIN_WORKLOAD_BONUS = Decimal("10")
    OVER_PREFERRED_BONUS = Decimal("0")

    def calculate_subject_preference_score(
        self,
        faculty,
        subject,
        preference_cycle,
    ):
        preference = (
            faculty.preferences
            .filter(
                preference_cycle=preference_cycle,
                subject=subject,
            )
            .first()
        )

        if preference is None:
            return Decimal("0")

        return self.SUBJECT_PRIORITY_SCORES.get(
            preference.priority,
            Decimal("0"),
        )

    def calculate_section_preference_score(
        self,
        faculty,
        section,
        preference_cycle,
    ):
        preference = (
            faculty.preferred_sections
            .filter(
                preference_cycle=preference_cycle,
                section=section,
            )
            .first()
        )

        if preference is None:
            return Decimal("0")

        return self.SECTION_PRIORITY_SCORES.get(
            preference.priority,
            Decimal("0"),
        )

    def calculate_time_slot_preference_score(
        self,
        faculty,
        day,
        slot_number,
        preference_cycle,
    ):
        preference = (
            faculty.preferred_time_slots
            .filter(
                preference_cycle=preference_cycle,
                day=day,
                slot_number=slot_number,
            )
            .first()
        )

        if preference is None:
            return Decimal("0")

        return self.TIME_SLOT_PRIORITY_SCORES.get(
            preference.priority,
            Decimal("0"),
        )

    def calculate_workload_score(
        self,
        faculty,
        current_workload,
        preference_cycle,
    ):
        preference = (
            faculty.workload_preferences
            .filter(
                preference_cycle=preference_cycle,
            )
            .first()
        )

        if preference is None:
            return Decimal("0")

        if current_workload < preference.minimum_hours:
            return self.UNDERLOADED_BONUS

        if (
            preference.minimum_hours
            <= current_workload
            < preference.preferred_hours
        ):
            return self.PREFERRED_WORKLOAD_BONUS

        if current_workload <= preference.preferred_hours:
            return self.WITHIN_WORKLOAD_BONUS

        if current_workload <= preference.maximum_hours:
            return self.OVER_PREFERRED_BONUS

        return Decimal("0")

    def calculate_total_score(
        self,
        faculty,
        subject,
        section,
        day,
        slot_number,
        preference_cycle,
        current_workload=0,
    ):
        subject_score = self.calculate_subject_preference_score(
            faculty=faculty,
            subject=subject,
            preference_cycle=preference_cycle,
        )

        section_score = self.calculate_section_preference_score(
            faculty=faculty,
            section=section,
            preference_cycle=preference_cycle,
        )

        time_slot_score = (
            self.calculate_time_slot_preference_score(
                faculty=faculty,
                day=day,
                slot_number=slot_number,
                preference_cycle=preference_cycle,
            )
        )

        workload_score = self.calculate_workload_score(
            faculty=faculty,
            current_workload=current_workload,
            preference_cycle=preference_cycle,
        )

        total_score = (
            subject_score
            + section_score
            + time_slot_score
            + workload_score
        )

        return {
            "subject_score": subject_score,
            "section_score": section_score,
            "time_slot_score": time_slot_score,
            "workload_score": workload_score,
            "total_score": total_score,
        }