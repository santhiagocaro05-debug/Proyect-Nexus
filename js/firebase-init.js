// ============================================================
// CARGA DE FIREBASE CON FUNCIÓN ASYNC AUTOEJECUTABLE
// ============================================================

(async function() {
    try {
        const {
            auth,
            db,
            registerUser,
            loginUser,
            logoutUser,
            onAuthChange,
            loginWithGoogle,
            loginWithGithub,
            resetPassword,
            getUserProfile,
            saveUserProfile,
            getAllUsers,
            getComments,
            addComment,
            deleteComment,
            updateComment,
            getPosts,
            addPost,
            deletePost,
            uploadAvatar,
            listenUsers,
            listenComments,
            listenPosts,
            doc,
            updateDoc,
            getDoc,
            getProducts,
            addProduct,
            updateProduct,
            deleteProduct,
            addProductReview,
            editProductReview,
            deleteProductReview,
            listenProductReviews,
            addActivityNotification,
            listenActivityNotifications,
            incrementDownloadCount,
            addPostComment,
            editPostComment,
            deletePostComment,
            listenPostComments,
            searchUsers,
            getOrCreateChat,
            sendChatMessage,
            listenChatMessages,
            listenUserChats,
            getUserById,
            saveProductOrder,
            getProductOrder,
            addAppUpdate,
            getAppUpdates,
            deleteAppUpdate,
            updateAppUpdate,
            requestDeveloperStatus,
            getMyDeveloperRequestStatus,
            getDeveloperRequests,
            listenDeveloperRequests,
            reviewDeveloperRequest,
            isUserDeveloper,
            requestNexusPlusAccess,
            listenNexusPlusRequests,
            reviewNexusPlusRequest,
            addUserXP,
            getUserActivityStats,
            registerUserDownload,
            xpForLevel,
            levelFromXp,
            BADGE_DEFS,
            XP_REWARDS


        } = await import('./firebase-config.js');

        window.fb = {
            auth, db, registerUser, loginUser, logoutUser, onAuthChange,
            loginWithGoogle, loginWithGithub, resetPassword, getUserProfile,
            saveUserProfile, getAllUsers, getComments, addComment, deleteComment,
            updateComment, getPosts, addPost, deletePost, uploadAvatar,
            listenUsers, listenComments, listenPosts, doc, updateDoc, getDoc,
            getProducts, addProduct, updateProduct, deleteProduct,
            addProductReview, editProductReview, deleteProductReview,
            listenProductReviews, addActivityNotification, listenActivityNotifications,
            incrementDownloadCount, addPostComment, editPostComment, deletePostComment,
            listenPostComments, searchUsers, getOrCreateChat, sendChatMessage,
            listenChatMessages, listenUserChats, getUserById, saveProductOrder,
            getProductOrder, addAppUpdate, getAppUpdates, deleteAppUpdate,
            updateAppUpdate, requestDeveloperStatus, getMyDeveloperRequestStatus,
            getDeveloperRequests, listenDeveloperRequests, reviewDeveloperRequest,
            isUserDeveloper, requestNexusPlusAccess, listenNexusPlusRequests,
            reviewNexusPlusRequest, getUserActivityStats, registerUserDownload,
            xpForLevel, levelFromXp, BADGE_DEFS, XP_REWARDS
        };

        window.fbReady = true;
        console.log('✅ Firebase cargado correctamente');
        window.dispatchEvent(new Event('fb-ready'));

    } catch (err) {
        console.error('❌ No se pudo cargar firebase-config.js:', err);
        window.fbError = true;
        window.dispatchEvent(new Event('fb-error'));
    }
})();
