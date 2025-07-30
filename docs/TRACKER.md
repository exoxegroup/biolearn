 Phase 5: Group and Collaboration Features with AI
  This phase directly implements the core collaborative and AI-assisted features which are central to the research objectives.
   * Group Management (5.1) corresponds to requirement FR-205, allowing teachers to assign students to mini-groups.
   * Shared Notes Persistence (5.2) fulfills requirement FR-305, which calls for a shared, real-time notes document for students in
     mini-groups.
   * AI Assistant Integration (5.3) directly addresses FR-306, which specifies that an AI assistant should be available within the
     mini-group. Moving the API key to the backend is also in line with security best practices (NFR-3).


  Phase 6: Real-time Features and Class Controls
  This phase provides the technical foundation for the real-time classroom experience.
   * Socket.io Integration (6.1) is the backbone for several requirements:
       * The teacher control events (start-class, activate-groups, etc.) implement FR-207.
       * Broadcasting state changes enables the automated student navigation required by FR-304.
       * Real-time chat fulfills part of FR-401.
       * Presence tracking implements FR-402.
   * Jitsi Integration (6.2) completes the real-time communication requirement FR-401 by adding video and audio.


  Phase 7: Analytics and Final Integration
  This phase focuses on the data collection and reporting features, which are critical for the project's research goals.
   * Analytics Endpoints (7.1) directly implement FR-210 (Teacher performance analytics) and, more importantly, provide the data needed
     to measure the key success metrics defined in the PRD's "Research Objectives" section, such as comparing pre/post-test scores and
     analyzing engagement by gender.
   * Final Integration and Testing (7.2, 7.3, 7.4) ensures all mock data is removed and that data is persistently stored, fulfilling
     FR-403.


  Phase 8: Additional Features and Refinements
  This phase adds specific functionalities and usability improvements that are also defined in the PRD.
   * Teacher Dashboard Refinements (8.1) like renaming and deleting a class are part of FR-201 (A teacher must be able to create, edit,
     and delete classes).
   * Student Dashboard Features (8.2), such as viewing test scores, directly implement FR-308. The error handling for duplicate
     enrollment is a necessary refinement for a robust user experience, aligning with the goal of NFR-2 (Usability).