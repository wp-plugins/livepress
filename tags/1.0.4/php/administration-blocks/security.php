<div class="block sec">
    <h3><span class="security">Security</span></h3>
    <div class="block-content">
        <h4 class="wide">Enable LivePress for...</h4>
        <label title="no_users" class="left">
            <input type="radio" id="no_users" name="enabled_to"
                   value="none"
                       <?php checked( 'none', $options['enabled_to'] ); ?> />
            No Users
        </label>
        <label title="admin_users" class="left">
            <input type="radio" id="admin_users" name="enabled_to"
                   value="administrators"
                   <?php checked( 'administrators', $options['enabled_to'] ); ?> />
            Admin Users
        </label>
        <label title="registered_users" class="left">
            <input type="radio" id="registered_users" name="enabled_to"
                   value="registered"
                       <?php checked( 'registered', $options['enabled_to'] ); ?> />
            Registered Users
        </label>
        <label title="all_users" class="left">
            <input type="radio" id="all_users" name="enabled_to" value="all"
                <?php checked( 'all', $options['enabled_to'] ); ?> />
            All Users
        </label>
        <br class="clear"/>
        
        <span class="light">
            To make LivePress' update and comment notifications visible to all blog readers, select "All Users".
        </span>
    </div>
    
</div> 
